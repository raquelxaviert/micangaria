-- ==============================================
-- SISTEMA DE COLEÇÕES PARA MIÇANGARIA RÜGE
-- ==============================================

-- 1. TABELA DE COLEÇÕES
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações básicas
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Configuração visual
  color TEXT DEFAULT '#6b7280',
  
  -- Status e organização
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Metadados
  meta_title TEXT,
  meta_description TEXT
);

-- 2. TABELA DE RELACIONAMENTO PRODUTO-COLEÇÃO
CREATE TABLE IF NOT EXISTS collection_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relacionamentos
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Organização dentro da coleção
  display_order INTEGER DEFAULT 0,
  
  -- Evitar duplicatas
  UNIQUE(collection_id, product_id)
);

-- ==============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(display_order);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_order ON collection_products(collection_id, display_order);

-- ==============================================
-- 4. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==============================================

-- Collections - públicas para leitura, admins para modificação
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coleções são públicas para leitura" ON collections
FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar coleções" ON collections
FOR ALL USING (auth.role() = 'authenticated');

-- Collection Products - públicas para leitura, admins para modificação
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relacionamentos são públicos para leitura" ON collection_products
FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar relacionamentos" ON collection_products
FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- 5. TRIGGERS PARA UPDATED_AT
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 6. VIEWS ÚTEIS
-- ==============================================

-- View para coleções com contagem de produtos
CREATE OR REPLACE VIEW collections_with_counts AS
SELECT 
  c.*,
  COALESCE(cp.product_count, 0) as product_count
FROM collections c
LEFT JOIN (
  SELECT 
    collection_id,
    COUNT(*) as product_count
  FROM collection_products
  GROUP BY collection_id
) cp ON c.id = cp.collection_id
ORDER BY c.display_order, c.name;

-- View para produtos com suas coleções
CREATE OR REPLACE VIEW products_with_collections AS
SELECT 
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug,
        'color', c.color
      )
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'::json
  ) as collections
FROM products p
LEFT JOIN collection_products cp ON p.id = cp.product_id
LEFT JOIN collections c ON cp.collection_id = c.id AND c.is_active = true
GROUP BY p.id;

-- ==============================================
-- 7. FUNÇÕES ÚTEIS
-- ==============================================

-- Função para obter produtos de uma coleção
CREATE OR REPLACE FUNCTION get_collection_products(collection_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL,
  image_url TEXT,
  type TEXT,
  style TEXT,
  colors TEXT[],
  is_active BOOLEAN,
  is_new_arrival BOOLEAN,
  is_on_sale BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.type,
    p.style,
    p.colors,
    p.is_active,
    p.is_new_arrival,
    p.is_on_sale
  FROM products p
  JOIN collection_products cp ON p.id = cp.product_id
  JOIN collections c ON cp.collection_id = c.id
  WHERE c.slug = collection_slug 
    AND c.is_active = true 
    AND p.is_active = true
  ORDER BY cp.display_order, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 8. DADOS INICIAIS (COLEÇÕES PADRÃO)
-- ==============================================

INSERT INTO collections (name, description, slug, color, display_order, is_active) VALUES
('Promoções Especiais', 'Produtos em destaque com preços especiais', 'promocoes-especiais', '#dc2626', 1, true),
('Novidades', 'Últimas peças que chegaram ao nosso acervo', 'novidades', '#16a34a', 2, true),
('Peças Selecionadas', 'Curadoria especial de peças exclusivas', 'pecas-selecionadas', '#9333ea', 3, true),
('Coleção Vintage', 'Autênticas peças vintage com história', 'colecao-vintage', '#eab308', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================
-- 9. PERMISSÕES FINAIS
-- ==============================================

-- Dar permissões para usuários autenticados
GRANT ALL ON collections TO authenticated;
GRANT ALL ON collection_products TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Permitir acesso às views
GRANT SELECT ON collections_with_counts TO anon, authenticated;
GRANT SELECT ON products_with_collections TO anon, authenticated;

-- ==============================================
-- SETUP CONCLUÍDO! 
-- ==============================================

-- Para usar no frontend:
-- 1. SELECT * FROM collections_with_counts WHERE is_active = true ORDER BY display_order;
-- 2. SELECT * FROM get_collection_products('novidades');
-- 3. SELECT * FROM products_with_collections WHERE id = 'produto-id';

COMMENT ON TABLE collections IS 'Coleções temáticas de produtos (Novidades, Promoções, etc.)';
COMMENT ON TABLE collection_products IS 'Relacionamento Many-to-Many entre Collections e Products';
COMMENT ON FUNCTION get_collection_products(TEXT) IS 'Retorna todos os produtos ativos de uma coleção específica';