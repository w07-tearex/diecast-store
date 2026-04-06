-- Ensure: admin_accounts phải tồn tại để các RPC helper và policies không bị lỗi 42P01.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Chỉ cho phép tối đa 1 admin row.
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

-- Helper functions (SECURITY DEFINER) để API admin/status đọc được mà không bị RLS/anon chặn.
CREATE OR REPLACE FUNCTION public.admin_has_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_accounts);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_is_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_accounts a WHERE a.user_id = p_user_id);
END;
$$;

