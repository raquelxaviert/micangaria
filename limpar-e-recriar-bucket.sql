-- Script para limpar e recriar o bucket product-images
-- Execute este SQL no SQL Editor do Supabase

-- 1. PRIMEIRO: Remover todos os objetos do bucket product-images
DELETE FROM storage.objects WHERE bucket_id = 'product-images';

-- 2. Verificar se os objetos foram removidos
SELECT COUNT(*) as objetos_restantes FROM storage.objects WHERE bucket_id = 'product-images';

-- 3. Agora remover o bucket (se existir)
DELETE FROM storage.buckets WHERE id = 'product-images';

-- 4. Recriar o bucket corretamente
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection, created_at, updated_at)
VALUES (
  'product-images',
  'product-images',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  false,
  NOW(),
  NOW()
);

-- 5. Verificar se foi criado
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- 6. Ativar RLS (se não estiver ativo)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
