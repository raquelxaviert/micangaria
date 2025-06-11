-- ADICIONAR CAMPO CARE_INSTRUCTIONS À TABELA PRODUCTS
-- Execute este SQL no Supabase Dashboard -> SQL Editor

ALTER TABLE products 
ADD COLUMN care_instructions TEXT;

COMMENT ON COLUMN products.care_instructions IS 'Instruções de cuidados e manutenção do produto';

-- Verificar se foi adicionado com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'care_instructions'
AND table_schema = 'public';
