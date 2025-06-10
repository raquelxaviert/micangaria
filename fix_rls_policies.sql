-- CORREÇÃO DE POLÍTICAS RLS PARA ADMIN
-- Execute no SQL Editor do Supabase

-- 1. Verificar políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'products';

-- 2. Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Apenas admins podem modificar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;

-- 3. Criar políticas mais permissivas para desenvolvimento
-- Política para leitura (público)
CREATE POLICY "Produtos são públicos para leitura" ON products 
FOR SELECT USING (true);

-- Política para inserção (mais permissiva para desenvolvimento)
CREATE POLICY "Permitir inserção de produtos" ON products 
FOR INSERT WITH CHECK (true);

-- Política para atualização
CREATE POLICY "Permitir atualização de produtos" ON products 
FOR UPDATE USING (true);

-- Política para deleção
CREATE POLICY "Permitir deleção de produtos" ON products 
FOR DELETE USING (true);

-- 4. Verificar se RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'products';

-- 5. Garantir que RLS está ativo
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 7. TESTAR - Inserir produto de teste
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'TESTE RLS - Produto Admin', 
  'Produto para testar políticas RLS', 
  99.99, 
  'colar', 
  'boho', 
  ARRAY['teste'], 
  true
);

-- 8. Verificar se o produto foi inserido
SELECT id, name, sku FROM products WHERE name LIKE '%TESTE RLS%';

-- 9. OPCIONAL: Para produção, use políticas mais seguras
/*
-- Políticas mais seguras para produção (comentadas)
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON products;
DROP POLICY IF EXISTS "Permitir deleção de produtos" ON products;

CREATE POLICY "Admins podem inserir produtos" ON products 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins podem atualizar produtos" ON products 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar produtos" ON products 
FOR DELETE USING (auth.role() = 'authenticated');
*/
