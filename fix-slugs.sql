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

-- Corrigir slugs com espaços no final
UPDATE products 
SET slug = TRIM(slug)
WHERE slug LIKE '% ';

-- Verificar se a correção funcionou
SELECT id, name, slug, LENGTH(slug) as slug_length
FROM products 
WHERE slug LIKE '% ' OR slug LIKE ' %';

-- Mostrar todos os slugs para verificação
SELECT id, name, slug, LENGTH(slug) as slug_length
FROM products 
ORDER BY name;

-- Corrigir slugs específicos que foram identificados
UPDATE products 
SET slug = 'short-couro-carina-duek'
WHERE id = '1511b11e-7cd6-4d72-b39d-9fb34c84b9d6' AND slug = 'short-couro-carina-duek ';

UPDATE products 
SET slug = 'jaqueta-off-white'
WHERE id = '1ec58655-dc4c-4c49-b3ce-bd991f95ff5c' AND slug = 'jaqueta-off-white ';

-- Verificar se as correções foram aplicadas
SELECT id, name, slug, LENGTH(slug) as slug_length
FROM products 
WHERE id IN ('1511b11e-7cd6-4d72-b39d-9fb34c84b9d6', '1ec58655-dc4c-4c49-b3ce-bd991f95ff5c');
