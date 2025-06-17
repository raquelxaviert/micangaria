-- CONFIGURAÇÃO COMPLETA SUPABASE STORAGE + SKU
-- Execute TUDO no SQL Editor do Supabase Dashboard

-- ==============================================
-- 1. HABILITAR STORAGE (se não estiver ativo)
-- ==============================================

-- Primeiro, certifique-se que storage está ativo no dashboard

-- ==============================================
-- 2. CRIAR BUCKET PARA IMAGENS
-- ==============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 3. POLÍTICAS DE STORAGE
-- ==============================================

-- Remover política existente de visualização (se houver) para evitar erro de 'already exists'
DROP POLICY IF EXISTS "Imagens públicas para visualização" ON storage.objects;

-- Política para visualização pública
CREATE POLICY "Imagens públicas para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Remover políticas de upload/update/delete existentes para substituí-las
DROP POLICY IF EXISTS "Admins podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar" ON storage.objects;

-- Nova Política para upload (usuários autenticados)
CREATE POLICY "Admins podem fazer upload/update/delete" ON storage.objects
FOR ALL USING (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
  -- Opcional: Se quiser restringir a um UID específico, descomente e preencha abaixo:
  -- AND auth.uid() = 'SEU_ADMIN_UID_AQUI' 
);

-- ==============================================
-- 4. ATUALIZAR TABELA PRODUCTS PARA STORAGE
-- ==============================================

-- Adicionar colunas para storage se não existirem
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_storage_path TEXT,
ADD COLUMN IF NOT EXISTS gallery_storage_paths TEXT[];

-- ==============================================
-- 5. CONFIGURAR SKU AUTOMÁTICO (#20xx)
-- ==============================================

-- Remover view que depende de SKU antes de alterar a coluna
DROP VIEW IF EXISTS products_with_collections;

-- Atualizar campo SKU para formato correto
ALTER TABLE products
ALTER COLUMN sku TYPE TEXT;

-- Adicionar constraint para formato SKU
ALTER TABLE products
DROP CONSTRAINT IF EXISTS check_sku_format;

ALTER TABLE products
ADD CONSTRAINT check_sku_format CHECK (sku ~ '^#20[0-9]{2}$'::text);

-- Criar sequence para SKUs
DROP SEQUENCE IF EXISTS product_sku_seq;
CREATE SEQUENCE product_sku_seq START 2001;

-- ==============================================
-- 6. FUNÇÃO PARA GERAR SKU AUTOMATICAMENTE
-- ==============================================

CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas gerar SKU se estiver vazio
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku = '#' || nextval('product_sku_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS auto_generate_sku ON products;

-- Criar trigger para gerar SKU
CREATE TRIGGER auto_generate_sku
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_sku();

-- ==============================================
-- 7. FUNÇÃO PARA GERAR URL DE IMAGEM
-- ==============================================

-- Remover função e trigger que não são mais necessários
DROP TRIGGER IF EXISTS update_image_url ON products;
DROP FUNCTION IF EXISTS generate_image_url();

-- ==============================================
-- 8. RECRIAR VIEWS QUE DEPENDEM DE PRODUCTS
-- ==============================================

-- Recriar a view products_with_collections
CREATE OR REPLACE VIEW products_with_collections AS
SELECT
  p.*,
  COALESCE(
    (
      SELECT
        jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color))
      FROM
        collections c
      JOIN
        collection_products cp ON c.id = cp.collection_id
      WHERE
        cp.product_id = p.id
    ),
    '[]'::jsonb
  ) AS collections
FROM
  products p;

-- ==============================================
-- 9. TESTAR CONFIGURAÇÃO
-- ==============================================

-- Remover produto teste existente (se houver) para evitar conflitos de SKU
DELETE FROM products WHERE name = 'PRODUTO TESTE - SKU';
DELETE FROM products WHERE slug = 'cropped-jeans-vintage';

-- Inserir produto teste para verificar SKU
INSERT INTO products (
  name,
  description,
  price,
  type,
  style,
  colors,
  is_active,
  is_featured
) VALUES (
  'PRODUTO TESTE - SKU',
  'Produto para testar geração automática de SKU',
  99.99,
  'acessorio',
  'vintage',
  ARRAY['teste'],
  true,
  false
);

-- Verificar se SKU foi gerado
SELECT sku, name FROM products WHERE name LIKE '%TESTE%' ORDER BY created_at DESC LIMIT 1;

-- ==============================================
-- 10. VERIFICAÇÕES FINAIS
-- ==============================================

-- Verificar bucket criado
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Verificar policies de storage
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verificar sequence
SELECT currval('product_sku_seq');

-- Verificar produtos
SELECT id, sku, name, created_at FROM products ORDER BY created_at DESC LIMIT 5;

-- ==============================================
-- 11. LIMPEZA (OPCIONAL)
-- ==============================================

-- Se quiser remover o produto teste:
-- DELETE FROM products WHERE name LIKE '%TESTE%';

COMMIT;
