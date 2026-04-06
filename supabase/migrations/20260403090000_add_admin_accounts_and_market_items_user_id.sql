-- Admin accounts: chỉ cho phép tồn tại đúng 1 tài khoản admin duy nhất.
-- Marketplace listings: gắn listings với user đăng nhập để người dùng có thể quản lý P2P của mình.

-- 1) Admin accounts table
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Bảo đảm chỉ có tối đa 1 dòng trong admin_accounts.
CREATE OR REPLACE FUNCTION public.enforce_single_admin_account()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_accounts) THEN
    RAISE EXCEPTION 'Only one admin account is allowed' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_single_admin_account ON public.admin_accounts;
CREATE TRIGGER trg_enforce_single_admin_account
BEFORE INSERT ON public.admin_accounts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_single_admin_account();

-- 2) Add user_id to marketplace listings
ALTER TABLE public.market_items
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS market_items_user_id_idx
  ON public.market_items (user_id);

