-- Configurar políticas de segurança para o bucket product-imgs
-- Isso é necessário para permitir uploads via API

-- 1. Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-imgs',
  'product-imgs',
  true,
  52428800, -- 50MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

-- 2. Políticas de SELECT (visualizar imagens)
CREATE POLICY "Public Access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-imgs');

-- 3. Políticas de INSERT (fazer upload)
CREATE POLICY "Allow authenticated uploads to product-imgs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-imgs');

-- 4. Políticas de UPDATE (atualizar imagens)
CREATE POLICY "Allow authenticated updates to product-imgs" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-imgs');

-- 5. Políticas de DELETE (deletar imagens)
CREATE POLICY "Allow authenticated deletes from product-imgs" ON storage.objects
FOR DELETE USING (bucket_id = 'product-imgs');

-- 6. Política mais permissiva para uploads de imagens de produtos
-- (caso as políticas acima não funcionem)
CREATE POLICY "Allow all operations on product-imgs" ON storage.objects
FOR ALL USING (bucket_id = 'product-imgs')
WITH CHECK (bucket_id = 'product-imgs');

-- 7. Habilitar RLS na tabela storage.objects (se não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 8. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 9. Listar buckets para verificar se foi criado
SELECT * FROM storage.buckets WHERE id = 'product-imgs';
