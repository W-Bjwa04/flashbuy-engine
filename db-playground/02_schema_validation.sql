-- Clean up test records first if any exist from previous runs
DELETE FROM payments WHERE transaction_reference LIKE 'test_txn_%';
DELETE FROM order_items WHERE price_at_purchase = 999.99;
DELETE FROM orders WHERE total_amount = 999.99;
DELETE FROM products WHERE title = 'FlashBuy Test Phone';
DELETE FROM users WHERE email LIKE 'test_user_%@flashbuy.internal';

DO $$
DECLARE
    v_user_id INT;
    v_product_id INT;
    v_order_id UUID;
    v_rand TEXT := floor(random() * 1000000)::TEXT;
    v_fk_blocked BOOLEAN := FALSE;
    v_check_stock_blocked BOOLEAN := FALSE;
    v_check_qty_blocked BOOLEAN := FALSE;
    v_unique_email_blocked BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE '🚀 RUNNING FLASHBUY SCHEMA VERIFICATION SUITE';
    RAISE NOTICE '==================================================';

    -- ----------------------------------------------------------------
    -- 1. Happy Path Seed
    -- ----------------------------------------------------------------
    INSERT INTO users (name, email, password_hash)
    VALUES ('Test Runner', 'test_user_' || v_rand || '@flashbuy.internal', '$2b$10$xyz')
    RETURNING id INTO v_user_id;

    INSERT INTO products (title, description, price, official_stock, is_flash_sale)
    VALUES ('FlashBuy Test Phone', 'Flash Sale Unit', 999.99, 10, TRUE)
    RETURNING id INTO v_product_id;

    INSERT INTO orders (user_id, total_amount, status)
    VALUES (v_user_id, 999.99, 'PENDING')
    RETURNING id INTO v_order_id;

    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (v_order_id, v_product_id, 1, 999.99);

    INSERT INTO payments (order_id, transaction_reference, amount, status)
    VALUES (v_order_id, 'test_txn_' || v_rand, 999.99, 'PAID');

    RAISE NOTICE '[PASSED] TEST 1: Happy path insertion successful.';

    -- ----------------------------------------------------------------
    -- 2. CHECK Constraint: Negative Stock
    -- ----------------------------------------------------------------
    BEGIN
        UPDATE products SET official_stock = -5 WHERE id = v_product_id;
    EXCEPTION 
        WHEN check_violation OR SQLSTATE '23514' THEN
            v_check_stock_blocked := TRUE;
    END;

    IF v_check_stock_blocked THEN
        RAISE NOTICE '[PASSED] TEST 2: Negative inventory blocked by CHECK constraint.';
    ELSE
        RAISE EXCEPTION 'TEST 2 FAILED: Negative inventory was allowed!';
    END IF;

    -- ----------------------------------------------------------------
    -- 3. CHECK Constraint: Zero Quantity
    -- ----------------------------------------------------------------
    BEGIN
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES (v_order_id, v_product_id, 0, 999.99);
    EXCEPTION 
        WHEN check_violation OR SQLSTATE '23514' THEN
            v_check_qty_blocked := TRUE;
    END;

    IF v_check_qty_blocked THEN
        RAISE NOTICE '[PASSED] TEST 3: Zero quantity blocked by CHECK constraint.';
    ELSE
        RAISE EXCEPTION 'TEST 3 FAILED: Zero quantity was accepted!';
    END IF;

    -- ----------------------------------------------------------------
    -- 4. UNIQUE Constraint: Duplicate Email
    -- ----------------------------------------------------------------
    BEGIN
        INSERT INTO users (name, email, password_hash)
        VALUES ('Duplicate Runner', 'test_user_' || v_rand || '@flashbuy.internal', '$2b$10$xyz');
    EXCEPTION 
        WHEN unique_violation OR SQLSTATE '23505' THEN
            v_unique_email_blocked := TRUE;
    END;

    IF v_unique_email_blocked THEN
        RAISE NOTICE '[PASSED] TEST 4: Duplicate user email blocked by UNIQUE constraint.';
    ELSE
        RAISE EXCEPTION 'TEST 4 FAILED: Duplicate email was permitted!';
    END IF;

    -- ----------------------------------------------------------------
    -- 5. Foreign Key RESTRICT: Delete user while orders exist
    -- ----------------------------------------------------------------
    BEGIN
        DELETE FROM users WHERE id = v_user_id;
    EXCEPTION 
        WHEN foreign_key_violation OR SQLSTATE '23503' THEN
            v_fk_blocked := TRUE;
    END;

    IF v_fk_blocked THEN
        RAISE NOTICE '[PASSED] TEST 5: ON DELETE RESTRICT on users protected active orders.';
    ELSE
        RAISE EXCEPTION 'TEST 5 FAILED: User was deleted despite having referenced orders!';
    END IF;

    -- ----------------------------------------------------------------
    -- 6. Foreign Key CASCADE: Delete order cascades to order_items
    -- ----------------------------------------------------------------
    -- Payment table has RESTRICT on order_id, so remove payment record first
    DELETE FROM payments WHERE order_id = v_order_id;
    -- Delete the order; order_items must cascade
    DELETE FROM orders WHERE id = v_order_id;

    IF NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = v_order_id) THEN
        RAISE NOTICE '[PASSED] TEST 6: ON DELETE CASCADE on order_items verified.';
    ELSE
        RAISE EXCEPTION 'TEST 6 FAILED: Order items remained orphaned!';
    END IF;

    -- Clean up remaining test user and product
    DELETE FROM products WHERE id = v_product_id;
    DELETE FROM users WHERE id = v_user_id;

    RAISE NOTICE '==================================================';
    RAISE NOTICE '🎉 ALL 6 SCHEMA VERIFICATION TESTS PASSED!';
    RAISE NOTICE '==================================================';
END $$;