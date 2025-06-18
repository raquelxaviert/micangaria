-- Adicionar campos para reserva de estoque
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_reserved INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_available INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar tabela para reservas de estoque
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_id ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_user_id ON stock_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires_at ON stock_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_session_id ON stock_reservations(session_id);

-- Função para limpar reservas expiradas
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

-- Trigger para atualizar estoque quando reserva é criada/atualizada
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

-- Políticas RLS para stock_reservations
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias reservas
CREATE POLICY "Users can view their own reservations" ON stock_reservations
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias reservas
CREATE POLICY "Users can create their own reservations" ON stock_reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias reservas
CREATE POLICY "Users can update their own reservations" ON stock_reservations
    FOR UPDATE USING (auth.uid() = user_id);

-- Todos os usuários autenticados podem ver todas as reservas (para admin purposes)
-- TODO: Implementar sistema de roles adequado no futuro
CREATE POLICY "Authenticated users can view all reservations" ON stock_reservations
    FOR ALL USING (auth.role() = 'authenticated'); 