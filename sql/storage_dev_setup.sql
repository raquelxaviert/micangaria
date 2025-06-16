-- Configuração simplificada para desenvolvimento
-- Remove todas as restrições de segurança para uploads de imagens de produtos

-- 1. Desabilitar RLS temporariamente na tabela storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes para o bucket product-imgs
DROP POLICY IF EXISTS "Public Access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to product-imgs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to product-imgs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from product-imgs" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on product-imgs" ON storage.objects;

-- 3. Criar política super permissiva para desenvolvimento
CREATE POLICY "Allow all operations on product-imgs bucket" ON storage.objects
FOR ALL
USING (bucket_id = 'product-imgs')
WITH CHECK (bucket_id = 'product-imgs');

-- 4. Reabilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Garantir que o bucket existe e está configurado corretamente
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-imgs',
  'product-imgs',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

-- 6. Verificar configuração
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-imgs';
