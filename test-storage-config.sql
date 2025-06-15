-- Script de teste para verificar se o Storage está funcionando
-- Execute este no SQL Editor do Supabase após executar o setup

-- 1. Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- 2. Verificar políticas RLS
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

-- 3. Verificar se RLS está ativado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- 4. Testar listagem de buckets (deve retornar product-images)
-- Este comando você pode testar via JavaScript no console do navegador:
-- const { data, error } = await supabase.storage.listBuckets()
-- console.log('Buckets:', data, 'Error:', error)
