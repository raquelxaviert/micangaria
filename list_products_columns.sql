-- LISTAR TODAS AS COLUNAS DA TABELA PRODUCTS
-- Execute este SQL no Supabase Dashboard -> SQL Editor

-- 1. Listar todas as colunas com detalhes
SELECT 
    ordinal_position as "Posição",
    column_name as "Nome da Coluna",
    data_type as "Tipo de Dados",
    is_nullable as "Permite NULL",
    column_default as "Valor Padrão",
    character_maximum_length as "Tamanho Máximo"
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Listar apenas os nomes das colunas (mais simples)
SELECT column_name as "Colunas da Tabela Products"
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se colunas específicas existem
SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as "care_instructions"
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'care_instructions'
AND table_schema = 'public'

UNION ALL

SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as "gallery_urls"
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'gallery_urls'
AND table_schema = 'public'

UNION ALL

SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as "materials"
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'materials'
AND table_schema = 'public'

UNION ALL

SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as "sizes"
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'sizes'
AND table_schema = 'public';
