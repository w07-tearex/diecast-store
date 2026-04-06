-- ==========================================
-- Unified Auth: Profiles and Roles
-- ==========================================

-- 1. Create Role Enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Migration: Move existing admin from admin_accounts to profiles
-- We check if admin_accounts exists first to avoid errors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_accounts' AND table_schema = 'public') THEN
    INSERT INTO public.profiles (id, email, role)
    SELECT user_id, email, 'admin'::public.app_role
    FROM public.admin_accounts
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;

-- 4. Trigger: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    CASE 
      WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Updated RLS Policies (using profiles instead of admin_accounts)

-- Helper function for policies to keep them readable
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- PROFILES policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Update existing table policies to use is_admin()

-- PRODUCTS
DROP POLICY IF EXISTS products_insert_admin ON public.products;
CREATE POLICY products_insert_admin ON public.products FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS products_update_admin ON public.products;
CREATE POLICY products_update_admin ON public.products FOR UPDATE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS products_delete_admin ON public.products;
CREATE POLICY products_delete_admin ON public.products FOR DELETE TO authenticated USING (is_admin());

-- MARKET_ITEMS
DROP POLICY IF EXISTS market_items_select_public_or_owner_or_admin ON public.market_items;
CREATE POLICY market_items_select_public_or_owner_or_admin ON public.market_items FOR SELECT USING (
  status = 'approved' OR user_id = auth.uid() OR is_admin()
);

DROP POLICY IF EXISTS market_items_update_admin ON public.market_items;
CREATE POLICY market_items_update_admin ON public.market_items FOR UPDATE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS market_items_delete_admin ON public.market_items;
CREATE POLICY market_items_delete_admin ON public.market_items FOR DELETE TO authenticated USING (is_admin());

-- ORDERS
DROP POLICY IF EXISTS orders_select_owner_or_admin ON public.orders;
CREATE POLICY orders_select_owner_or_admin ON public.orders FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR is_admin()
);

DROP POLICY IF EXISTS orders_update_admin ON public.orders;
CREATE POLICY orders_update_admin ON public.orders FOR UPDATE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS orders_delete_admin ON public.orders;
CREATE POLICY orders_delete_admin ON public.orders FOR DELETE TO authenticated USING (is_admin());

-- ORDER_ITEMS
DROP POLICY IF EXISTS order_items_select_for_owner_or_admin ON public.order_items;
CREATE POLICY order_items_select_for_owner_or_admin ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND (o.user_id = auth.uid() OR is_admin())
  )
);
