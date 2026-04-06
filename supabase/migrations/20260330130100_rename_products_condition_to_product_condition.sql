-- Migration cũ có thể đã tạo cột `condition` — đổi sang `product_condition` (tên an toàn với PostgREST).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'condition'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'product_condition'
    ) THEN
      ALTER TABLE public.products RENAME COLUMN condition TO product_condition;
    ELSE
      UPDATE public.products
      SET product_condition = COALESCE(NULLIF(TRIM(product_condition), ''), condition, 'new');
      ALTER TABLE public.products DROP COLUMN condition;
    END IF;
  END IF;
END $$;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_condition TEXT DEFAULT 'new';
UPDATE public.products SET product_condition = 'new' WHERE product_condition IS NULL;
