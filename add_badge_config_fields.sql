-- Add badge configuration fields to products table
-- This allows admins to control which badges are displayed on product cards

-- Add the badge configuration columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS show_colors_badge boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_materials_badge boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_sizes_badge boolean DEFAULT true;

-- Add comments to explain the purpose of these fields
COMMENT ON COLUMN products.show_colors_badge IS 'Controls whether the colors badge is displayed on product cards';
COMMENT ON COLUMN products.show_materials_badge IS 'Controls whether the materials badge is displayed on product cards';
COMMENT ON COLUMN products.show_sizes_badge IS 'Controls whether the sizes badge is displayed on product cards';

-- Update existing products to show all badges by default (if the fields are NULL)
UPDATE products 
SET 
  show_colors_badge = COALESCE(show_colors_badge, true),
  show_materials_badge = COALESCE(show_materials_badge, true),
  show_sizes_badge = COALESCE(show_sizes_badge, true)
WHERE 
  show_colors_badge IS NULL 
  OR show_materials_badge IS NULL 
  OR show_sizes_badge IS NULL;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('show_colors_badge', 'show_materials_badge', 'show_sizes_badge')
ORDER BY column_name;
