-- DIAGNÓSTICO: Verificar estado atual do Storage
-- Execute este script primeiro para ver o que temos

-- 1. Listar todos os buckets existentes
SELECT 
  id,
  name,
  public,
  created_at,
  updated_at,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;

-- 2. Verificar especificamente o bucket product-images
SELECT 
  id,
  name,
  public,
  owner,
  created_at
FROM storage.buckets 
WHERE id = 'product-images' OR name = 'product-images';

-- 3. Verificar políticas RLS existentes
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
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- 4. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
