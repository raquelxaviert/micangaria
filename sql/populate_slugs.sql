-- Script para popular o campo slug nos produtos existentes
-- Execute este script no Supabase SQL Editor

-- Atualizar todos os produtos que não têm slug definido
UPDATE products 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[áàâãä]', 'a', 'gi'),
      '[éèêë]', 'e', 'gi'
    ),
    '[íìîï]', 'i', 'gi'
  )
)
WHERE slug IS NULL OR slug = '';

-- Remover acentos restantes e caracteres especiais
UPDATE products 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(slug, '[óòôõö]', 'o', 'gi'),
            '[úùûü]', 'u', 'gi'
          ),
          '[ç]', 'c', 'gi'
        ),
        '[^a-z0-9\s-]', '', 'gi'
      ),
      '\s+', '-', 'gi'
    ),
    '--+', '-', 'gi'
  )
)
WHERE slug IS NOT NULL;

-- Remover hífens no início e fim
UPDATE products 
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL;

-- Garantir que slugs sejam únicos adicionando sufixo numérico se necessário
WITH duplicates AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM products 
  WHERE slug IS NOT NULL
)
UPDATE products 
SET slug = products.slug || '-' || (duplicates.rn - 1)
FROM duplicates 
WHERE products.id = duplicates.id 
  AND duplicates.rn > 1;

-- Verificar resultado
SELECT id, name, slug FROM products ORDER BY created_at;
