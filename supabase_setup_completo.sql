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

-- Política para visualização pública
CREATE POLICY "Imagens públicas para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para upload (usuários autenticados)
CREATE POLICY "Admins podem fazer upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para atualização
CREATE POLICY "Admins podem atualizar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para deleção
CREATE POLICY "Admins podem deletar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
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

-- Atualizar campo SKU para formato correto
ALTER TABLE products 
ALTER COLUMN sku TYPE TEXT;

-- Adicionar constraint para formato SKU
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS check_sku_format;

ALTER TABLE products 
ADD CONSTRAINT check_sku_format CHECK (sku ~ '^#20[0-9]{2}$');

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

CREATE OR REPLACE FUNCTION generate_image_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Se tem path do storage, gerar URL completa
  IF NEW.image_storage_path IS NOT NULL AND NEW.image_storage_path != '' THEN
    NEW.image_url = 'https://koduoglrfzronbcgqrjc.supabase.co/storage/v1/object/public/product-images/' || NEW.image_storage_path;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_image_url ON products;

-- Criar trigger para URL de imagem
CREATE TRIGGER update_image_url
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_image_url();

-- ==============================================
-- 8. TESTAR CONFIGURAÇÃO
-- ==============================================

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
-- 9. VERIFICAÇÕES FINAIS
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
-- 10. LIMPEZA (OPCIONAL)
-- ==============================================

-- Se quiser remover o produto teste:
-- DELETE FROM products WHERE name LIKE '%TESTE%';

COMMIT;
