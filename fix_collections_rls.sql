-- CORREÇÃO DAS POLÍTICAS RLS PARA COLEÇÕES
-- Execute no SQL Editor do Supabase

-- ==============================================
-- PROBLEMA IDENTIFICADO: 
-- As políticas RLS exigem auth.role() = 'authenticated'
-- mas estamos usando a chave anon (anônima)
-- ==============================================

-- 1. Verificar políticas atuais
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('collections', 'collection_products');

-- 2. CORREÇÃO: Remover políticas restritivas atuais
DROP POLICY IF EXISTS "Apenas admins podem modificar coleções" ON collections;
DROP POLICY IF EXISTS "Apenas admins podem modificar relacionamentos" ON collection_products;

-- 3. CRIAR políticas mais permissivas para desenvolvimento
-- (Em produção, você pode implementar autenticação real)

-- Política para collections
CREATE POLICY "Desenvolvimento - permitir todas operações em collections" ON collections
FOR ALL USING (true) WITH CHECK (true);

-- Política para collection_products  
CREATE POLICY "Desenvolvimento - permitir todas operações em collection_products" ON collection_products
FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar se as novas políticas foram criadas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('collections', 'collection_products');

-- 5. Teste rápido de inserção
-- (será removido automaticamente)
INSERT INTO collection_products (collection_id, product_id, display_order) 
SELECT 
  (SELECT id FROM collections WHERE slug = 'promocoes-especiais' LIMIT 1),
  (SELECT id FROM products WHERE is_active = true LIMIT 1),
  1
WHERE EXISTS (SELECT 1 FROM collections WHERE slug = 'promocoes-especiais')
  AND EXISTS (SELECT 1 FROM products WHERE is_active = true);

-- 6. Verificar se a inserção funcionou
SELECT 
  cp.id,
  c.name as collection_name,
  p.name as product_name
FROM collection_products cp
JOIN collections c ON cp.collection_id = c.id
JOIN products p ON cp.product_id = p.id
LIMIT 5;

-- 7. Limpar o teste
DELETE FROM collection_products 
WHERE id IN (
  SELECT cp.id 
  FROM collection_products cp 
  JOIN collections c ON cp.collection_id = c.id 
  WHERE c.slug = 'promocoes-especiais'
  LIMIT 1
);

COMMENT ON POLICY "Desenvolvimento - permitir todas operações em collections" ON collections 
IS 'Política permissiva para desenvolvimento - substituir por autenticação real em produção';

COMMENT ON POLICY "Desenvolvimento - permitir todas operações em collection_products" ON collection_products 
IS 'Política permissiva para desenvolvimento - substituir por autenticação real em produção';
