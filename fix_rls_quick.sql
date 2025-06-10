-- SOLUÇÃO RÁPIDA - DESABILITAR RLS TEMPORARIAMENTE
-- Execute no SQL Editor do Supabase para desenvolvimento

-- OPÇÃO 1: Desabilitar RLS completamente (desenvolvimento apenas)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Ou manter RLS mas com políticas muito permissivas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Produtos são públicos para leitura" ON products;
DROP POLICY IF EXISTS "Apenas admins podem modificar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON products;
DROP POLICY IF EXISTS "Permitir deleção de produtos" ON products;

-- Criar política universal (muito permissiva - apenas para desenvolvimento)
CREATE POLICY "Acesso total para desenvolvimento" ON products 
FOR ALL USING (true) WITH CHECK (true);

-- Testar inserção
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'TESTE FINAL - Admin', 
  'Produto para testar se RLS foi corrigido', 
  123.45, 
  'anel', 
  'vintage', 
  ARRAY['dourado'], 
  true
) RETURNING id, name, sku;
