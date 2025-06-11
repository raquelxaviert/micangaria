-- ATUALIZAÇÃO PARA SUPORTE A MÚLTIPLAS IMAGENS
-- Execute este SQL no Supabase Dashboard -> SQL Editor

-- 1. Verificar se a coluna gallery_urls já existe na tabela products
DO $$
BEGIN
    -- Adicionar coluna gallery_urls se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'gallery_urls'
    ) THEN
        ALTER TABLE products ADD COLUMN gallery_urls TEXT[];
        RAISE NOTICE '✅ Coluna gallery_urls adicionada à tabela products';
    ELSE
        RAISE NOTICE '✅ Coluna gallery_urls já existe na tabela products';
    END IF;
    
    -- Adicionar coluna image_alt se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'image_alt'
    ) THEN
        ALTER TABLE products ADD COLUMN image_alt TEXT;
        RAISE NOTICE '✅ Coluna image_alt adicionada à tabela products';
    ELSE
        RAISE NOTICE '✅ Coluna image_alt já existe na tabela products';
    END IF;
END $$;

-- 2. Função para validar URLs de imagens
CREATE OR REPLACE FUNCTION validate_image_urls()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar image_url principal
  IF NEW.image_url IS NOT NULL AND NEW.image_url != '' THEN
    IF NOT (NEW.image_url ~* '^(https?://|/).*\.(jpg|jpeg|png|webp|gif)(\?.*)?$') THEN
      RAISE EXCEPTION 'URL da imagem principal deve ser uma URL válida de imagem';
    END IF;
  END IF;
  
  -- Validar URLs da galeria
  IF NEW.gallery_urls IS NOT NULL THEN
    DECLARE
      url TEXT;
    BEGIN
      FOREACH url IN ARRAY NEW.gallery_urls
      LOOP
        IF url IS NOT NULL AND url != '' THEN
          IF NOT (url ~* '^(https?://|/).*\.(jpg|jpeg|png|webp|gif)(\?.*)?$') THEN
            RAISE EXCEPTION 'Todas as URLs da galeria devem ser URLs válidas de imagem: %', url;
          END IF;
        END IF;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para validação
DROP TRIGGER IF EXISTS validate_product_images ON products;
CREATE TRIGGER validate_product_images
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_image_urls();

-- 4. Função para contar total de imagens por produto
CREATE OR REPLACE FUNCTION count_product_images(product_row products)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    CASE WHEN product_row.image_url IS NOT NULL AND product_row.image_url != '' THEN 1 ELSE 0 END +
    CASE WHEN product_row.gallery_urls IS NOT NULL THEN array_length(product_row.gallery_urls, 1) ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql;

-- 5. View para produtos com informações de imagens
CREATE OR REPLACE VIEW products_with_image_info AS
SELECT 
  p.*,
  count_product_images(p) as total_images,
  CASE 
    WHEN p.image_url IS NOT NULL AND p.image_url != '' THEN 
      ARRAY[p.image_url] || COALESCE(p.gallery_urls, ARRAY[]::TEXT[])
    ELSE 
      COALESCE(p.gallery_urls, ARRAY[]::TEXT[])
  END as all_images
FROM products p;

-- 6. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_gallery_urls ON products USING GIN (gallery_urls);
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products (image_url) WHERE image_url IS NOT NULL;

-- 7. Comentários para documentação
COMMENT ON COLUMN products.gallery_urls IS 'Array de URLs de imagens adicionais do produto (além da image_url principal)';
COMMENT ON COLUMN products.image_alt IS 'Texto alternativo para todas as imagens do produto (acessibilidade)';
COMMENT ON FUNCTION count_product_images IS 'Conta o número total de imagens de um produto (principal + galeria)';
COMMENT ON VIEW products_with_image_info IS 'View com informações estendidas sobre as imagens dos produtos';

-- 8. Inserir produto de teste com múltiplas imagens
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  image_url,
  gallery_urls,
  image_alt,
  colors,
  materials,
  sizes,
  is_active,
  is_featured
) VALUES (
  'TESTE - Múltiplas Imagens', 
  'Produto para testar funcionalidade de múltiplas imagens', 
  159.99, 
  'colar', 
  'vintage',
  '/products/colar.jpg',
  ARRAY['/products/colar2.jpg', '/products/colar3.jpg', '/products/colar4.jpg'],
  'Colar vintage com múltiplas imagens de exemplo',
  ARRAY['dourado', 'vintage'],
  ARRAY['metal', 'cristal'],
  ARRAY['único'],
  true,
  true
) ON CONFLICT (name) DO UPDATE SET
  gallery_urls = EXCLUDED.gallery_urls,
  image_alt = EXCLUDED.image_alt,
  updated_at = NOW();

-- 9. Verificações finais
SELECT 
  'Verificação da estrutura de múltiplas imagens' AS status,
  COUNT(*) as total_produtos,
  COUNT(CASE WHEN gallery_urls IS NOT NULL AND array_length(gallery_urls, 1) > 0 THEN 1 END) as produtos_com_galeria,
  AVG(count_product_images(products.*))::NUMERIC(10,2) as media_imagens_por_produto
FROM products
WHERE is_active = true;

-- 10. Exemplo de consulta com múltiplas imagens
SELECT 
  name,
  total_images,
  all_images
FROM products_with_image_info 
WHERE is_active = true 
  AND total_images > 1
ORDER BY total_images DESC, created_at DESC
LIMIT 5;

-- Mensagem de sucesso
SELECT '🎉 Configuração de múltiplas imagens concluída com sucesso!' as resultado;
