-- CORREÇÃO RÁPIDA PARA PROBLEMAS DE UUID NAS COLEÇÕES
-- Execute no SQL Editor do Supabase

-- 1. Verificar coleções existentes
SELECT id, name, slug FROM collections;

-- 2. Limpar dados de teste se existirem
DELETE FROM collection_products WHERE collection_id NOT IN (SELECT id FROM collections);

-- 3. Verificar se temos produtos reais para testar
SELECT id, name FROM products LIMIT 5;

-- 4. Se não tiver produtos, vamos criar um produto de teste
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'Produto Teste para Coleções', 
  'Produto criado para testar o sistema de coleções', 
  99.99, 
  'acessorio', 
  'vintage', 
  ARRAY['teste'], 
  true
) ON CONFLICT (sku) DO NOTHING
RETURNING id, name, sku;

-- 5. Mostrar IDs reais das coleções (UUIDs válidos)
SELECT 
  id as collection_uuid,
  name,
  slug
FROM collections
ORDER BY display_order;

-- 6. Teste de inserção com IDs reais
-- (será executado no próximo script Node.js)
