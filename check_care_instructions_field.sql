-- VERIFICAR SE O CAMPO CARE_INSTRUCTIONS EXISTE NA TABELA PRODUCTS
-- Execute este SQL no Supabase Dashboard -> SQL Editor

-- 1. Verificar estrutura da tabela products
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar especificamente o campo care_instructions
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            AND column_name = 'care_instructions'
            AND table_schema = 'public'
        ) 
        THEN '✅ Campo care_instructions EXISTE na tabela products'
        ELSE '❌ Campo care_instructions NÃO EXISTE na tabela products'
    END as status;

-- 3. Se o campo não existir, aqui está o comando para adicionar:
/*
ALTER TABLE products 
ADD COLUMN care_instructions TEXT;

COMMENT ON COLUMN products.care_instructions IS 'Instruções de cuidados e manutenção do produto';
*/

-- 4. Verificar campos relacionados que também podem ser úteis
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
AND column_name IN (
    'care_instructions',
    'description',
    'materials',
    'notes',
    'meta_description'
)
ORDER BY column_name;
