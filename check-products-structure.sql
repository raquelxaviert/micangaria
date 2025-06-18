-- Verificar estrutura da tabela products
SELECT 'ESTRUTURA ATUAL DA TABELA PRODUCTS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Verificar especificamente as colunas necessárias para reserva de estoque
SELECT 'COLUNAS NECESSÁRIAS PARA RESERVA DE ESTOQUE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('stock_reserved', 'stock_available', 'last_stock_update', 'name')
ORDER BY column_name;

-- Adicionar colunas de estoque se não existirem
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_reserved INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_available INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar se a tabela stock_reservations existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'stock_reservations'
) as table_exists;

-- Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed', 'cancelled')),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_id ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_user_id ON stock_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires_at ON stock_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_session_id ON stock_reservations(session_id);

-- Habilitar RLS
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
DROP POLICY IF EXISTS "Users can view their own reservations" ON stock_reservations;
CREATE POLICY "Users can view their own reservations" ON stock_reservations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own reservations" ON stock_reservations;
CREATE POLICY "Users can create their own reservations" ON stock_reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reservations" ON stock_reservations;
CREATE POLICY "Users can update their own reservations" ON stock_reservations
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view all reservations" ON stock_reservations;
CREATE POLICY "Authenticated users can view all reservations" ON stock_reservations
    FOR ALL USING (auth.role() = 'authenticated');

-- Verificar se as funções existem
SELECT 'FUNÇÕES NECESSÁRIAS:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('cleanup_expired_reservations', 'update_product_stock_on_reservation');

-- Criar função para limpar reservas expiradas se não existir
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
    -- Marcar reservas expiradas
    UPDATE stock_reservations 
    SET status = 'expired', updated_at = NOW()
    WHERE expires_at < NOW() AND status = 'active';
    
    -- Atualizar estoque disponível
    UPDATE products p
    SET 
        stock_reserved = COALESCE(
            (SELECT SUM(quantity) 
             FROM stock_reservations sr 
             WHERE sr.product_id = p.id AND sr.status = 'active'), 
            0
        ),
        stock_available = GREATEST(1 - COALESCE(
            (SELECT SUM(quantity) 
             FROM stock_reservations sr 
             WHERE sr.product_id = p.id AND sr.status = 'active'), 
            0
        ), 0),
        last_stock_update = NOW()
    WHERE EXISTS (
        SELECT 1 FROM stock_reservations sr 
        WHERE sr.product_id = p.id AND sr.status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar estoque quando reserva é criada/atualizada
CREATE OR REPLACE FUNCTION update_product_stock_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estoque do produto
    UPDATE products 
    SET 
        stock_reserved = COALESCE(
            (SELECT SUM(quantity) 
             FROM stock_reservations sr 
             WHERE sr.product_id = NEW.product_id AND sr.status = 'active'), 
            0
        ),
        stock_available = GREATEST(1 - COALESCE(
            (SELECT SUM(quantity) 
             FROM stock_reservations sr 
             WHERE sr.product_id = NEW.product_id AND sr.status = 'active'), 
            0
        ), 0),
        last_stock_update = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_update_product_stock ON stock_reservations;
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT OR UPDATE OR DELETE ON stock_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_on_reservation();

-- Verificar se o trigger existe
SELECT 'TRIGGERS:' as info;
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_product_stock';

-- Verificar políticas RLS
SELECT 'POLÍTICAS RLS:' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'stock_reservations';

-- Estrutura final das tabelas
SELECT 'ESTRUTURA FINAL - PRODUCTS (COLUNAS DE ESTOQUE):' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('stock_reserved', 'stock_available', 'last_stock_update')
ORDER BY column_name;

SELECT 'ESTRUTURA FINAL - STOCK_RESERVATIONS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stock_reservations' 
ORDER BY ordinal_position; 