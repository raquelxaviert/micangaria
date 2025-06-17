-- Script para limpar slugs com espaços extras
-- Atualiza todos os slugs removendo espaços no início e fim

UPDATE products 
SET slug = TRIM(slug) 
WHERE slug IS NOT NULL 
  AND slug != TRIM(slug);

-- Verificar os slugs que foram alterados
SELECT id, name, slug, TRIM(slug) as clean_slug
FROM products 
WHERE slug IS NOT NULL 
  AND slug != TRIM(slug);
