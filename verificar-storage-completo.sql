-- TESTE DE VERIFICAÇÃO COMPLETA DO STORAGE
-- Execute este script completo no SQL Editor do Supabase

-- 1. Verificar se o bucket existe
SELECT 'BUCKET EXISTS:' as check_type, * FROM storage.buckets WHERE id = 'product-images';

-- 2. Verificar objetos no bucket (se houver)
SELECT 'OBJECTS COUNT:' as check_type, COUNT(*) as total FROM storage.objects WHERE bucket_id = 'product-images';

-- 3. Verificar configuração de RLS
SELECT 'RLS STATUS:' as check_type, schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('buckets', 'objects') AND schemaname = 'storage';

-- 4. Verificar políticas existentes
SELECT 'POLICIES:' as check_type, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'storage';

-- 5. Tentar criar um objeto de teste (pode dar erro se não tiver permissão)
-- INSERT INTO storage.objects (bucket_id, name, metadata) 
-- VALUES ('product-images', 'test.txt', '{"size": 4}');

-- 6. Verificar configurações do bucket
SELECT 'BUCKET CONFIG:' as check_type, 
       id, 
       name, 
       public, 
       file_size_limit, 
       allowed_mime_types,
       created_at,
       updated_at
FROM storage.buckets WHERE id = 'product-images';

-- 7. Listar todos os buckets para comparação
SELECT 'ALL BUCKETS:' as check_type, id, name, public FROM storage.buckets;
