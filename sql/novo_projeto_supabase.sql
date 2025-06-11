-- SETUP COMPLETO PARA NOVO PROJETO SUPABASE
-- Execute este SQL no novo projeto

-- 1. Habilitar RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 2. Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true
);

-- 3. Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Informações básicas
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- preço riscado
  cost_price DECIMAL(10,2), -- custo do produto
  
  -- Categoria e tipo
  category_id UUID REFERENCES categories(id),
  type TEXT CHECK (type IN ('acessorio', 'conjunto', 'bolsa', 'colar', 'brinco', 'pulseira', 'anel', 'cinto', 'sandalia')),
  style TEXT CHECK (style IN ('vintage', 'retro', 'boho-vintage', 'anos-80', 'anos-90', 'moderno')),
  
  -- Imagens e media
  image_url TEXT,
  image_alt TEXT,
  gallery_urls TEXT[], -- array de URLs de imagens adicionais
  
  -- Características
  colors TEXT[], -- array de cores
  materials TEXT[], -- array de materiais
  sizes TEXT[], -- array de tamanhos disponíveis
  weight_grams INTEGER,
  
  -- Inventory
  sku TEXT UNIQUE,
  barcode TEXT,
  track_inventory BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 0,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- SEO e URLs
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Flags e status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  
  -- Dados promocionais
  sale_start_date TIMESTAMP WITH TIME ZONE,
  sale_end_date TIMESTAMP WITH TIME ZONE,
  promotion_text TEXT,
  
  -- Tags para busca
  tags TEXT[],
  search_keywords TEXT,
  
  -- Metadados
  vendor TEXT,
  collection TEXT,
  notes TEXT
);

-- 4. Tabela de favoritos dos usuários
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- 5. RLS Policies

-- Categorias - públicas para leitura
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias são públicas para leitura" ON categories FOR SELECT USING (true);
CREATE POLICY "Apenas admins podem modificar categorias" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Produtos - públicos para leitura
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtos são públicos para leitura" ON products FOR SELECT USING (true);
CREATE POLICY "Apenas admins podem modificar produtos" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Favoritos - usuários podem ver e gerenciar apenas os próprios
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus próprios favoritos" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem adicionar favoritos" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem remover seus favoritos" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- 6. Inserir categorias iniciais
INSERT INTO categories (name, description, slug) VALUES 
  ('Acessórios', 'Anéis, pulseiras e acessórios diversos', 'acessorios'),
  ('Colares', 'Colares vintage e modernos', 'colares'),
  ('Brincos', 'Brincos únicos e especiais', 'brincos'),
  ('Conjuntos', 'Conjuntos harmonizados', 'conjuntos'),
  ('Bolsas', 'Bolsas e carteiras', 'bolsas'),
  ('Cintos', 'Cintos e faixas', 'cintos'),
  ('Calçados', 'Sandálias e sapatos', 'calcados')
ON CONFLICT (slug) DO NOTHING;

-- 7. Inserir alguns produtos exemplo (opcional)
INSERT INTO products (
  name, description, price, type, style, colors, image_url, is_active, is_featured, is_new_arrival
) VALUES 
  (
    'Anel Vintage Dourado',
    'Anel vintage em metal dourado com design atemporal. Uma peça que adiciona elegância e sofisticação ao seu look.',
    185.90,
    'anel',
    'vintage',
    ARRAY['dourado', 'ouro', 'bronze'],
    '/products/anel.jpg',
    true,
    true,
    true
  ),
  (
    'Bolsa Vintage Couro',
    'Bolsa em couro legítimo com acabamento vintage. Perfeita para o dia a dia com muito estilo.',
    340.00,
    'bolsa',
    'vintage',
    ARRAY['marrom', 'caramelo', 'couro'],
    '/products/bolsa.jpg',
    true,
    true,
    false
  ),
  (
    'Colar Vintage Pérolas',
    'Colar delicado com pérolas vintage. Uma peça clássica e elegante para ocasiões especiais.',
    225.50,
    'colar',
    'vintage',
    ARRAY['branco', 'pérola', 'prata'],
    '/products/colar.jpg',
    true,
    false,
    true
  )
ON CONFLICT (sku) DO NOTHING;

-- 8. Indexes para performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product ON user_favorites(product_id);

-- 9. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Função para buscar favoritos de um usuário
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_price DECIMAL,
    product_image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        p.price as product_price,
        p.image_url as product_image_url
    FROM user_favorites uf
    JOIN products p ON uf.product_id = p.id
    WHERE uf.user_id = user_uuid AND p.is_active = true
    ORDER BY uf.created_at DESC;
END;
$$;
