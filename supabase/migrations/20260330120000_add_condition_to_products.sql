-- Tránh tên cột `condition` (dễ xung đột PostgREST/SQL). Dùng product_condition (TEXT).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_condition TEXT DEFAULT 'new';

UPDATE public.products
SET product_condition = 'new'
WHERE product_condition IS NULL;

COMMENT ON COLUMN public.products.product_condition IS
  'new | used_like_new | used_lightly_played | used_heavily_played | used_damaged';
