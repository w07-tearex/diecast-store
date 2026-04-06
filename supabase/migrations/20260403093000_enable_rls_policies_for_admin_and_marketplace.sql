-- Row Level Security (RLS) để bảo vệ admin và P2P theo đúng yêu cầu:
-- - Admin: chỉ 1 tài khoản duy nhất (admin_accounts + trigger ở migration trước)
-- - Marketplace:
--   - Public chỉ đọc listing đã approved
--   - User đăng nhập chỉ thấy được listing của chính họ (dù pending/approved)
--   - User chỉ xóa listing pending của chính họ
--   - Admin có thể update/delete toàn bộ market_items
-- - Products:
--   - Public đọc được
--   - Admin insert/update/delete
-- - Orders/order_items:
--   - Owner đọc & chỉ được cancel (status='cancelled')
--   - Admin đọc/update/delete

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper: check admin existence
-- (No function to keep policy simple and explicit.)

-- =========================
-- admin_accounts
-- =========================
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_accounts_select ON public.admin_accounts;
CREATE POLICY admin_accounts_select
  ON public.admin_accounts
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS admin_accounts_insert ON public.admin_accounts;
CREATE POLICY admin_accounts_insert
  ON public.admin_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =========================
-- market_items
-- =========================
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS market_items_select_public_or_owner_or_admin ON public.market_items;
CREATE POLICY market_items_select_public_or_owner_or_admin
  ON public.market_items
  FOR SELECT
  USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS market_items_insert_owner ON public.market_items;
CREATE POLICY market_items_insert_owner
  ON public.market_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS market_items_update_admin ON public.market_items;
CREATE POLICY market_items_update_admin
  ON public.market_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS market_items_delete_owner_pending ON public.market_items;
CREATE POLICY market_items_delete_owner_pending
  ON public.market_items
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS market_items_delete_admin ON public.market_items;
CREATE POLICY market_items_delete_admin
  ON public.market_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

-- =========================
-- products
-- =========================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_public ON public.products;
CREATE POLICY products_select_public
  ON public.products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS products_insert_admin ON public.products;
CREATE POLICY products_insert_admin
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS products_update_admin ON public.products;
CREATE POLICY products_update_admin
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS products_delete_admin ON public.products;
CREATE POLICY products_delete_admin
  ON public.products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

-- =========================
-- orders
-- =========================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_select_owner_or_admin ON public.orders;
CREATE POLICY orders_select_owner_or_admin
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS orders_insert_any_or_owner ON public.orders;
CREATE POLICY orders_insert_any_or_owner
  ON public.orders
  FOR INSERT
  WITH CHECK (
    -- Cho phép tạo đơn khi:
    -- - anon thì user_id có thể null
    -- - login thì user_id phải trùng auth.uid()
    user_id IS NULL
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS orders_update_owner_cancelled_only ON public.orders;
CREATE POLICY orders_update_owner_cancelled_only
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    status = 'cancelled'
  );

DROP POLICY IF EXISTS orders_update_admin ON public.orders;
CREATE POLICY orders_update_admin
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS orders_delete_admin ON public.orders;
CREATE POLICY orders_delete_admin
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts a
      WHERE a.user_id = auth.uid()
    )
  );

-- =========================
-- order_items
-- =========================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_items_select_for_owner_or_admin ON public.order_items;
CREATE POLICY order_items_select_for_owner_or_admin
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.admin_accounts a
            WHERE a.user_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS order_items_insert_for_orders_insert_context ON public.order_items;
CREATE POLICY order_items_insert_for_orders_insert_context
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.user_id IS NULL
          OR o.user_id = auth.uid()
        )
    )
  );

