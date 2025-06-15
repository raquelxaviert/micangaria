-- Configuração do Supabase Storage para o projeto Micangaria
-- Execute este SQL no SQL Editor do Supabase

-- 1. Criar o bucket 'product-images' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 2. REMOVER políticas existentes (se houver conflito)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 3. Criar políticas RLS para permitir acesso público ao bucket product-images

-- Política para SELECT (visualizar arquivos) - público
CREATE POLICY "Allow public read access on product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política para INSERT (upload de arquivos) - público
CREATE POLICY "Allow public insert access on product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Política para UPDATE (atualizar arquivos) - público  
CREATE POLICY "Allow public update access on product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Política para DELETE (deletar arquivos) - público
CREATE POLICY "Allow public delete access on product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- 4. Verificar se o bucket foi criado corretamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'product-images';
