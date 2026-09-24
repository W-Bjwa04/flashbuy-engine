import { Request, Response, NextFunction } from 'express';
import { client as redis } from '../redis/client';
import { AppError } from '../errors/AppError';
import logger from '../lib/logger';

const WINDOW_SIZE_MS = 60 * 1000; // 1-minute sliding window
const MAX_REQUESTS = 3;            // Max 3 checkout attempts per minute

/**
 * Sliding-window rate limiter backed by a Redis Sorted Set (ZSET).
 *
 * Algorithm (4 atomic ops via MULTI/EXEC):
 *   1. ZREMRANGEBYSCORE  – evict entries older than (now - 60 s)
 *   2. ZCARD             – count surviving hits in current window
 *   3. ZADD + EXPIRE     – record this hit and refresh the TTL
 *
 * Key schema:  rate_limit:orders:<userId>
 * Member:      "<timestamp>-<random_suffix>"   (guarantees uniqueness)
 * Score:       Date.now() (ms)
 */
export async function orderSlidingWindowRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    return next(new AppError(401, 'Unauthorized: Identity context missing.'));
  }

  const rateLimitKey = `rate_limit:orders:${userId}`;
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE_MS;

  try {
    // --- Phase 1: Evict stale entries + count current window hits (atomic) ---
    const checkPipeline = redis.multi();
    checkPipeline.zRemRangeByScore(rateLimitKey, 0, windowStart); // evict old entries
    checkPipeline.zCard(rateLimitKey);                             // count active entries

    const [, currentCount] = (await checkPipeline.exec()) as [unknown, number];

    if (currentCount >= MAX_REQUESTS) {
      // Pinpoint when the oldest entry in this window will expire
      const oldestEntries = await redis.zRangeWithScores(rateLimitKey, 0, 0);
      const oldestScore = oldestEntries.length > 0 ? oldestEntries[0].score : now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestScore + WINDOW_SIZE_MS - now) / 1000));

      // Standard rate-limit response headers
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((oldestScore + WINDOW_SIZE_MS) / 1000));

      logger.warn(
        `[Rate Limit] User ${userId} blocked on POST /api/orders — ${currentCount}/${MAX_REQUESTS} hits in window. Retry after ${retryAfterSeconds}s.`
      );

      return next(
        new AppError(429, `Too many checkout attempts. Please retry after ${retryAfterSeconds} seconds.`)
      );
    }

    // --- Phase 2: Record this request atomically ---
    const uniqueMember = `${now}-${Math.random().toString(36).substring(2, 8)}`;
    await redis
      .multi()
      .zAdd(rateLimitKey, { score: now, value: uniqueMember })
      .expire(rateLimitKey, 60) // auto-cleanup key 60 s after last hit
      .exec();

    // Informational headers visible to clients / Postman
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - (currentCount + 1)));

    next();
  } catch (error) {
    // Fail-open: a Redis outage must not bring down checkout
    logger.error({ error }, '[Rate Limiter] Redis pipeline failed — failing open for resilience.');
    next();
  }
}
