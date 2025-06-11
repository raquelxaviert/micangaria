-- CONFIGURAÇÃO SUPABASE STORAGE PARA IMAGENS
-- Execute no SQL Editor do Supabase

-- 1. Criar bucket para produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para upload (usuários autenticados podem fazer upload)
CREATE POLICY "Admins podem fazer upload de imagens" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Política para leitura pública (qualquer um pode ver as imagens)
CREATE POLICY "Imagens são públicas para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- 4. Política para atualização (apenas donos)
CREATE POLICY "Admins podem atualizar imagens" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- 5. Política para deleção (apenas donos)
CREATE POLICY "Admins podem deletar imagens" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- 6. Atualizar tabela de produtos para usar URLs do Storage
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_storage_path TEXT,
ADD COLUMN IF NOT EXISTS gallery_storage_paths TEXT[];

-- 7. Trigger para gerar URL completa automaticamente
CREATE OR REPLACE FUNCTION generate_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_storage_path IS NOT NULL THEN
    NEW.image_url = 'https://koduoglrfzronbcgqrjc.supabase.co/storage/v1/object/public/product-images/' || NEW.image_storage_path;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_image_url
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_image_url();

-- 8. Atualizar campo SKU para formato #20--
ALTER TABLE products 
ALTER COLUMN sku TYPE TEXT,
ADD CONSTRAINT check_sku_format CHECK (sku ~ '^#20[0-9]{2}$');

-- 9. Sequence para gerar SKUs automaticamente
CREATE SEQUENCE IF NOT EXISTS product_sku_seq START 2001;

-- 10. Função para gerar SKU automaticamente
CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL THEN
    NEW.sku = '#' || nextval('product_sku_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_sku
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_sku();
