-- Adicionar campo para controlar otimização de imagens
-- Este campo indica se as imagens do produto já foram transferidas do Google Drive para o Supabase Storage

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images_optimized BOOLEAN DEFAULT FALSE;

-- Comentário para documentar o campo
COMMENT ON COLUMN products.images_optimized IS 'Flag que indica se as imagens do produto foram otimizadas (transferidas do Google Drive para Supabase Storage)';

-- Criar índice para consultas rápidas de produtos que precisam de otimização
CREATE INDEX IF NOT EXISTS idx_products_images_optimized ON products(images_optimized) WHERE images_optimized = FALSE;

-- Atualizar produtos que não têm imagens para marcar como otimizados (evitar processamento desnecessário)
UPDATE products 
SET images_optimized = TRUE 
WHERE (image_url IS NULL OR image_url = '') 
  AND (gallery_urls IS NULL OR array_length(gallery_urls, 1) IS NULL OR array_length(gallery_urls, 1) = 0);
