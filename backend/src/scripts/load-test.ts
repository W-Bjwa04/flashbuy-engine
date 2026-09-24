import autocannon from 'autocannon';
import { pool } from '../lib/db';
import { client as redis, connectRedis } from '../redis/client';
import logger from '../lib/logger';

// ─── Test Configuration ───────────────────────────────────────────────────────
const API_URL = 'http://localhost:4000/api/orders';

/**
 * Replace TARGET_PRODUCT_ID with any flash-sale product UUID from your DB.
 * You can get one by running: SELECT id FROM products WHERE is_flash_sale = true LIMIT 1;
 */
const TARGET_PRODUCT_ID = process.env.LOAD_TEST_PRODUCT_ID ?? 'YOUR_PRODUCT_UUID_HERE';

/**
 * Replace with a valid signed JWT for a test user.
 * Tip: log in via POST /api/auth/login and paste the returned token here,
 * or set the LOAD_TEST_TOKEN env variable before running.
 */
const AUTH_TOKEN = process.env.LOAD_TEST_TOKEN ?? 'YOUR_BEARER_TOKEN_HERE';

const INITIAL_STOCK = 100;

// ─── Setup ────────────────────────────────────────────────────────────────────
async function setupInventory(): Promise<void> {
  logger.info('[Load Test Setup] Connecting to Redis...');
  await connectRedis();

  logger.info('[Load Test Setup] Resetting PostgreSQL stock to 100 units...');
  await pool.query(
    `UPDATE products
     SET official_stock = $1,
         is_flash_sale  = true,
         updated_at     = NOW()
     WHERE id = $2`,
    [INITIAL_STOCK, TARGET_PRODUCT_ID]
  );

  const stockKey = `product:${TARGET_PRODUCT_ID}:stock`;
  const metaKey  = `product:${TARGET_PRODUCT_ID}:meta`;

  logger.info('[Load Test Setup] Resetting Redis stock cache to 100 units...');
  await redis
    .multi()
    .set(stockKey, String(INITIAL_STOCK))
    .hSet(metaKey, {
      is_flash_sale:  'true',
      official_stock: String(INITIAL_STOCK),
    })
    .exec();

  // Flush any stale rate-limit keys so each run starts clean
  const rateLimitKeys = await redis.keys('rate_limit:orders:*');
  if (rateLimitKeys.length > 0) {
    await redis.del(rateLimitKeys);
    logger.info(`[Load Test Setup] Flushed ${rateLimitKeys.length} stale rate-limit key(s).`);
  }

  logger.info('[Load Test Setup] ✅ Inventory synchronised. Benchmark ready.');
}

// ─── Audit ────────────────────────────────────────────────────────────────────
async function auditIntegrity(): Promise<void> {
  const dbRes = await pool.query<{ official_stock: number }>(
    'SELECT official_stock FROM products WHERE id = $1',
    [TARGET_PRODUCT_ID]
  );

  const finalDbStock    = Number(dbRes.rows[0]?.official_stock ?? -1);
  const finalRedisStock = Number(await redis.get(`product:${TARGET_PRODUCT_ID}:stock`));

  console.log('\n══════════════════ INTEGRITY AUDIT ══════════════════');
  console.log(`  Initial seeded stock  : ${INITIAL_STOCK}`);
  console.log(`  Final Redis stock     : ${finalRedisStock}`);
  console.log(`  Final PostgreSQL stock: ${finalDbStock}`);
  console.log('═════════════════════════════════════════════════════');

  if (finalDbStock < 0) {
    console.error('❌  RACE CONDITION DETECTED — stock dropped below 0 in PostgreSQL!');
    process.exit(1);
  } else if (finalDbStock > INITIAL_STOCK) {
    console.error('❌  DATA INTEGRITY ERROR — stock is higher than initial value!');
    process.exit(1);
  } else {
    const unitsSold = INITIAL_STOCK - finalDbStock;
    console.log(`✅  PASS — ${unitsSold} unit(s) sold. Zero race conditions detected.`);
  }
}

// ─── Benchmark ────────────────────────────────────────────────────────────────
async function runBenchmark(): Promise<void> {
  if (TARGET_PRODUCT_ID === 'YOUR_PRODUCT_UUID_HERE') {
    console.error(
      '⚠️  Please set TARGET_PRODUCT_ID or export LOAD_TEST_PRODUCT_ID=<uuid> before running.'
    );
    process.exit(1);
  }

  if (AUTH_TOKEN === 'YOUR_BEARER_TOKEN_HERE') {
    console.error(
      '⚠️  Please set AUTH_TOKEN or export LOAD_TEST_TOKEN=<jwt> before running.'
    );
    process.exit(1);
  }

  await setupInventory();

  logger.info('🚀 Launching Autocannon — 5 000 requests over 10 seconds (100 connections)...');

  const instance = autocannon({
    url: API_URL,
    connections: 100,    // 100 concurrent HTTP connection pipelines
    duration: 10,        // 10-second window
    amount: 5000,        // up-to 5 000 requests
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${AUTH_TOKEN}`,
    },
    method: 'POST',
    body: JSON.stringify({
      productId:   TARGET_PRODUCT_ID,
      quantity:    1,
      totalAmount: 199.99,
    }),
  });

  // Render an ASCII progress bar in the terminal
  autocannon.track(instance, { renderProgressBar: true });

  instance.on('done', async (result: autocannon.Result) => {
    logger.info('🏁 Autocannon run completed.');

    console.log('\n══════════════════ THROUGHPUT SUMMARY ══════════════════');
    console.table({
      'Total Requests Fired':       result.requests.total,
      '2xx Successes (Orders OK)':  result['2xx'],
      '4xx Blocked (Sold-out/429)': result['4xx'],
      '5xx Server Errors':          result['5xx'],
      'Avg Throughput (req/s)':     result.requests.average,
      'Avg Latency (ms)':           result.latency.average,
      'p99 Latency (ms)':           result.latency.p99,
    });

    await auditIntegrity();
    await pool.end();
    await redis.quit();
    process.exit(0);
  });
}

runBenchmark().catch((err) => {
  logger.error({ err }, '[Load Test] Fatal error during execution');
  process.exit(1);
});
