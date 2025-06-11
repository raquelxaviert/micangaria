-- CORREÇÃO INTELIGENTE DE CONSTRAINTS - FLEXÍVEL MAS ORGANIZADA
-- Execute no SQL Editor do Supabase

-- ==============================================
-- 1. REMOVER constraints restritivas atuais
-- ==============================================

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_type_values;
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_style_values;

-- ==============================================
-- 2. CRIAR tabelas de referência para sugestões
-- ==============================================

-- Tabela de tipos de produto (sugestões/padrões)
CREATE TABLE IF NOT EXISTS product_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estilos (sugestões/padrões)
CREATE TABLE IF NOT EXISTS product_styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. INSERIR tipos e estilos padrão
-- ==============================================

-- Tipos padrão
INSERT INTO product_types (name, display_name, description) VALUES 
  ('acessorio', 'Acessório', 'Acessórios diversos'),
  ('conjunto', 'Conjunto', 'Conjuntos de peças'),
  ('bolsa', 'Bolsa', 'Bolsas e carteiras'),
  ('colar', 'Colar', 'Colares e gargantilhas'),
  ('brinco', 'Brinco', 'Brincos diversos'),
  ('pulseira', 'Pulseira', 'Pulseiras e braceletes'),
  ('anel', 'Anel', 'Anéis diversos'),
  ('cinto', 'Cinto', 'Cintos e faixas'),
  ('sandalia', 'Sandália', 'Sandálias e calçados')
ON CONFLICT (name) DO NOTHING;

-- Estilos padrão
INSERT INTO product_styles (name, display_name, description) VALUES 
  ('vintage', 'Vintage', 'Estilo vintage clássico'),
  ('retro', 'Retrô', 'Estilo retrô'),
  ('boho-vintage', 'Boho Vintage', 'Mistura de boho com vintage'),
  ('anos-80', 'Anos 80', 'Estilo dos anos 80'),
  ('anos-90', 'Anos 90', 'Estilo dos anos 90'),
  ('boho', 'Boho', 'Estilo boêmio'),
  ('indígena', 'Indígena', 'Inspiração indígena'),
  ('minimalista', 'Minimalista', 'Estilo minimalista'),
  ('étnico', 'Étnico', 'Inspiração étnica'),
  ('moderno', 'Moderno', 'Estilo moderno contemporâneo')
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- 4. MODIFICAR tabela products (SEM constraints rígidas)
-- ==============================================

-- Manter campos como TEXT simples, sem constraints
-- Isso permite adicionar novos valores livremente
ALTER TABLE products 
ALTER COLUMN type TYPE TEXT,
ALTER COLUMN style TYPE TEXT;

-- ==============================================
-- 5. CRIAR função para obter sugestões
-- ==============================================

-- Função para buscar tipos disponíveis
CREATE OR REPLACE FUNCTION get_product_types()
RETURNS TABLE (
  name TEXT,
  display_name TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pt.name, pt.display_name, pt.description
  FROM product_types pt
  WHERE pt.is_default = true
  ORDER BY pt.display_name;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar estilos disponíveis
CREATE OR REPLACE FUNCTION get_product_styles()
RETURNS TABLE (
  name TEXT,
  display_name TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ps.name, ps.display_name, ps.description
  FROM product_styles ps
  WHERE ps.is_default = true
  ORDER BY ps.display_name;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 6. TESTE: Inserir produto para verificar flexibilidade
-- ==============================================

-- Teste com tipo padrão
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'TESTE - Tipo Padrão', 
  'Produto com tipo da lista padrão', 
  99.99, 
  'colar',
  'boho',
  ARRAY['dourado'], 
  true
) RETURNING id, name, type, style, sku;

-- Teste com tipo personalizado (novo)
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active
) VALUES (
  'TESTE - Tipo Novo', 
  'Produto com tipo personalizado', 
  149.99, 
  'chapéu',  -- NOVO TIPO!
  'hippie',   -- NOVO ESTILO!
  ARRAY['colorido'], 
  true
) RETURNING id, name, type, style, sku;

-- ==============================================
-- 7. VERIFICAÇÃO: Ver sugestões disponíveis
-- ==============================================

-- Ver tipos padrão
SELECT * FROM get_product_types();

-- Ver estilos padrão
SELECT * FROM get_product_styles();

-- Ver todos os tipos usados nos produtos (incluindo novos)
SELECT DISTINCT type, COUNT(*) as quantidade
FROM products 
WHERE type IS NOT NULL
GROUP BY type
ORDER BY quantidade DESC;

-- Ver todos os estilos usados nos produtos (incluindo novos)
SELECT DISTINCT style, COUNT(*) as quantidade
FROM products 
WHERE style IS NOT NULL
GROUP BY style
ORDER BY quantidade DESC;
