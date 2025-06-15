-- SOLUÇÃO RADICAL: Resetar Storage completamente
-- Execute este script no SQL Editor do Supabase

-- 1. DELETAR TODOS OS OBJETOS E BUCKETS (CUIDADO!)
DELETE FROM storage.objects;
DELETE FROM storage.buckets;

-- 2. RECRIAR BUCKET COM CONFIGURAÇÃO MÍNIMA
INSERT INTO storage.buckets (
  id, 
  name, 
  public,
  created_at,
  updated_at
) VALUES (
  'images',
  'images',
  true,
  NOW(),
  NOW()
);

-- 3. VERIFICAR SE FOI CRIADO
SELECT * FROM storage.buckets WHERE id = 'images';

-- 4. VERIFICAR PERMISSÕES
SELECT 
  schemaname, 
  tablename, 
  tableowner,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage';

-- 5. LISTAR POLÍTICAS EXISTENTES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage';
