-- CONFIGURAÇÃO DE STORAGE PARA DESENVOLVIMENTO
-- Execute este arquivo no Supabase Dashboard -> SQL Editor

-- 1. Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Imagens públicas para visualização" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar" ON storage.objects;
DROP POLICY IF EXISTS "Public upload para product-images" ON storage.objects;

-- 3. Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "Public select product-images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public upload para product-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public update para product-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Public delete para product-images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');

-- 4. Verificar se bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-images';

-- 5. Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 6. Adicionar colunas para storage na tabela products se não existirem
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_storage_path TEXT,
ADD COLUMN IF NOT EXISTS gallery_storage_paths TEXT[];

-- Sucesso
SELECT 'Configuração de Storage concluída com sucesso!' as status;
