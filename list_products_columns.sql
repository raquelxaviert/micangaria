-- COMANDO PARA LISTAR COLUNAS DA TABELA PRODUCTS
-- Execute no SQL Editor do Supabase

-- Opção 1: Listar todas as colunas com detalhes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Opção 2: Comando mais simples (PostgreSQL)
\d products;

-- Opção 3: Ver apenas os nomes das colunas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Opção 4: Ver constraints (chaves, checks, etc.)
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass;

-- Opção 5: Ver índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'products';
