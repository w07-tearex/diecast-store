-- Helper functions để đọc trạng thái admin mà không bị RLS chặn (tình huống anon).

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

