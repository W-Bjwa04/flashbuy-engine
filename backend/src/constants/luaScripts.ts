/**
 * Centralized Redis Lua Scripts
 */
export const LUA_SCRIPTS = {
    /**
     * Atomically checks and decrements product inventory.
     * KEYS[1] = Product stock tracking key ("product:UUID:stock")
     * ARGV[1] = Requested checkout quantity string
     * 
     * Returns:
     *   >= 0 : Remaining stock after successful deduction
     *     -1 : Insufficient stock / Out of stock
     *     -2 : Product key does not exist in Redis
     */
    decrementStock: `
        local exists = redis.call('exists', KEYS[1])
        if exists == 0 then
            return -2
        end

        local current = tonumber(redis.call('get', KEYS[1]) or 0)
        local qty = tonumber(ARGV[1])

        if current >= qty then
            return redis.call('decrby', KEYS[1], qty)
        else
            return -1
        end
    `,
};
