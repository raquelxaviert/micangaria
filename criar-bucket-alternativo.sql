-- SOLUÇÃO DEFINITIVA: Criar bucket com nome alternativo
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, limpar qualquer vestígio do bucket problemático
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.buckets WHERE id = 'product-images';

-- 2. Criar bucket com nome novo e configuração específica
INSERT INTO storage.buckets (
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'product-imgs',
  'product-imgs',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- 3. Verificar se foi criado
SELECT 'NOVO BUCKET:' as status, * FROM storage.buckets WHERE id = 'product-imgs';

-- 4. Testar listagem (deve funcionar)
-- Este comando deveria funcionar na interface agora
