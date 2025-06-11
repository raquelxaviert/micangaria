-- CORREÇÃO DE CONSTRAINT DO CAMPO TYPE
-- Execute no SQL Editor do Supabase

-- 1. Verificar todas as constraints da tabela products
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass;

-- 2. Listar colunas da tabela products
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 3. SOLUÇÃO: Remover constraint restritiva do type
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;

-- 4. OU atualizar constraint para incluir todos os tipos que estamos usando
ALTER TABLE products ADD CONSTRAINT products_type_check 
CHECK (type IN (
  'acessorio',
  'conjunto', 
  'bolsa', 
  'colar', 
  'brinco', 
  'pulseira', 
  'anel', 
  'cinto', 
  'sandalia'
));

-- 5. Testar inserção com valor que dava erro
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'TESTE TYPE - Colar', 
  'Produto para testar constraint type', 
  99.99, 
  'colar',
  'vintage',
  ARRAY['teste'], 
  true
) RETURNING id, name, type, sku;

-- 6. ALTERNATIVA: Remover constraint completamente (mais flexível)
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;

-- 7. Verificar se ainda há outras constraints problemáticas
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname LIKE '%check%';
