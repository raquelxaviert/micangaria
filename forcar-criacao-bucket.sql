-- SCRIPT FORÇADO: Criar bucket product-images
-- Execute este script se o diagnóstico mostrar que o bucket não existe

-- 1. Remover bucket se existir (para começar limpo)
DELETE FROM storage.buckets WHERE id = 'product-images';

-- 2. Criar bucket product-images forçadamente
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  avif_autodetection,
  created_at,
  updated_at
) VALUES (
  'product-images',
  'product-images',
  true,  -- PÚBLICO
  52428800,  -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  false,
  now(),
  now()
);

-- 3. Verificar se foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- 4. Limpar todas as políticas existentes (fresh start)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 5. Criar políticas simples e funcionais
CREATE POLICY "product-images-select" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product-images-insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product-images-update" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product-images-delete" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');

-- 6. Verificar políticas criadas
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE 'product-images%';
