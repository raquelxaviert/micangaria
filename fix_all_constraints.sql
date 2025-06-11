-- CORREÇÃO COMPLETA DE CONSTRAINTS DA TABELA PRODUCTS
-- Execute TUDO no SQL Editor do Supabase

-- ==============================================
-- 1. DIAGNÓSTICO: Verificar constraints atuais
-- ==============================================

-- Ver todas as constraints da tabela products
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass;

-- Ver colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- ==============================================
-- 2. CORREÇÃO: Remover constraints restritivas
-- ==============================================

-- Remover constraints de type e style que podem estar causando problemas
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_type_values;
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_style_values;

-- ==============================================
-- 3. RECRIAR constraints mais flexíveis
-- ==============================================

-- Constraint para type (incluindo todos os tipos que usamos)
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

-- Constraint para style (incluindo todos os estilos que usamos)
ALTER TABLE products ADD CONSTRAINT products_style_check 
CHECK (style IN (
  'vintage', 
  'retro', 
  'boho-vintage', 
  'anos-80', 
  'anos-90', 
  'boho',
  'indígena',
  'minimalista',
  'étnico',
  'moderno'
));

-- ==============================================
-- 4. ALTERNATIVA: Remover constraints completamente (mais flexível)
-- ==============================================

-- Se ainda houver problemas, remova as constraints completamente:
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_check;

-- ==============================================
-- 5. TESTE: Inserir produto para verificar se funciona
-- ==============================================

INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'TESTE CONSTRAINT - Colar Boho', 
  'Produto para testar se constraints foram corrigidas', 
  99.99, 
  'colar',
  'boho',
  ARRAY['dourado', 'vintage'], 
  true
) RETURNING id, name, type, style, sku;

-- ==============================================
-- 6. VERIFICAÇÃO FINAL
-- ==============================================

-- Ver constraints finais
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname LIKE '%check%';

-- Ver último produto inserido para confirmar que funcionou
SELECT id, name, type, style, sku, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 1;

-- ==============================================
-- 7. LIMPEZA (OPCIONAL)
-- ==============================================

-- Se quiser remover o produto de teste:
-- DELETE FROM products WHERE name LIKE '%TESTE CONSTRAINT%';
