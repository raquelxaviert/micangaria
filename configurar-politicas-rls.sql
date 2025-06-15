-- Script para configurar políticas RLS APÓS criar o bucket
-- Execute DEPOIS do script de limpeza e recriação

-- 1. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow public read access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access on product images" ON storage.objects;

-- 2. Criar políticas para acesso público ao bucket product-images

-- Política para SELECT (visualizar arquivos)
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Política para INSERT (upload de arquivos)
CREATE POLICY "Public insert access for product images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- Política para UPDATE (atualizar arquivos)
CREATE POLICY "Public update access for product images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Política para DELETE (deletar arquivos)
CREATE POLICY "Public delete access for product images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product-images');

-- 3. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%product images%';

-- 4. Testar se o bucket está acessível
SELECT 
  id,
  name, 
  public,
  file_size_limit,
  owner
FROM storage.buckets 
WHERE id = 'product-images';
