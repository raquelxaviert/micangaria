-- PARTE 2: SKU AUTOMÁTICO (#20xx)
-- Execute DEPOIS da Parte 1

-- Atualizar campo SKU para formato correto
ALTER TABLE products 
ALTER COLUMN sku TYPE TEXT;

-- Criar sequence para SKUs (começa em #2001)
CREATE SEQUENCE IF NOT EXISTS product_sku_seq START 2001;

-- Função para gerar SKU automaticamente
CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas gerar SKU se estiver vazio
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku = '#' || nextval('product_sku_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar SKU (sem DROP)
CREATE OR REPLACE TRIGGER auto_generate_sku
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_sku();

-- Testar com produto
INSERT INTO products (
  name, 
  description, 
  price, 
  type, 
  style, 
  colors, 
  is_active,
  is_featured
) VALUES (
  'TESTE SKU', 
  'Produto para testar SKU automático', 
  99.99, 
  'acessorio', 
  'vintage', 
  ARRAY['teste'], 
  true,
  false
);

-- Verificar se funcionou
SELECT sku, name FROM products WHERE name LIKE '%TESTE%' ORDER BY created_at DESC LIMIT 1;
