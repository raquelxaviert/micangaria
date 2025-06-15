-- TESTE DE CONECTIVIDADE BÁSICA
-- Execute este script para verificar se o problema é de conectividade

-- 1. Verificar se consegue acessar as tabelas do storage
SELECT 'PODE ACESSAR BUCKETS:' as teste, COUNT(*) as total FROM storage.buckets;

-- 2. Verificar se consegue acessar objects
SELECT 'PODE ACESSAR OBJECTS:' as teste, COUNT(*) as total FROM storage.objects;

-- 3. Verificar permissões do usuário atual
SELECT 
  'USUARIO ATUAL:' as teste,
  current_user as usuario,
  session_user as sessao;

-- 4. Verificar se RLS está causando problema
SELECT 
  'RLS STATUS:' as teste,
  schemaname,
  tablename,
  rowsecurity,
  tableowner
FROM pg_tables 
WHERE schemaname = 'storage';

-- 5. Tentar criar bucket com nome super simples
INSERT INTO storage.buckets (id, name, public) 
VALUES ('test', 'test', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  updated_at = NOW();

-- 6. Verificar se o bucket de teste foi criado
SELECT 'BUCKET TESTE:' as resultado, * FROM storage.buckets WHERE id = 'test';
