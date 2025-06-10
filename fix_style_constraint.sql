-- CORREÇÃO DE CONSTRAINT DO CAMPO STYLE
-- Execute no SQL Editor do Supabase

-- 1. Verificar constraint atual do campo style
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname LIKE '%style%';

-- 2. Verificar estrutura da tabela
\d products;

-- 3. SOLUÇÃO: Remover constraint restritiva do style
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_style_values;

-- 4. OU atualizar constraint para incluir valores que estamos usando
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_check;
ALTER TABLE products ADD CONSTRAINT products_style_check 
CHECK (style IN (
  'vintage', 
  'retro', 
  'boho-vintage', 
  'anos-80', 
  'anos-90', 
  'boho',           -- Adicionado
  'indígena',       -- Adicionado
  'minimalista',    -- Adicionado
  'étnico',         -- Adicionado
  'moderno'
));

-- 5. Testar inserção com valores que estamos usando
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'TESTE STYLE - Boho', 
  'Produto para testar constraint style', 
  99.99, 
  'colar', 
  'boho',           -- Este era o valor que dava erro
  ARRAY['teste'], 
  true
) RETURNING id, name, style, sku;

-- 6. ALTERNATIVA: Remover constraint completamente (mais simples)
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_check;
