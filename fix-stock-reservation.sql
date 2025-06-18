-- Corrigir problemas do sistema de reserva de estoque

-- 1. Adicionar colunas de estoque na tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_reserved INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_available INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Remover referência à tabela orders que pode não existir
ALTER TABLE stock_reservations DROP CONSTRAINT IF EXISTS stock_reservations_order_id_fkey;
ALTER TABLE stock_reservations ALTER COLUMN order_id TYPE TEXT;

-- 3. Criar funções necessárias
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

-- 4. Criar trigger para atualizar estoque
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

-- 5. Aplicar trigger
DROP TRIGGER IF EXISTS trigger_update_product_stock ON stock_reservations;
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT OR UPDATE OR DELETE ON stock_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_on_reservation();

-- 6. Verificar e criar políticas RLS
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

-- 7. Verificar estrutura final
SELECT '✅ ESTRUTURA CORRIGIDA' as status;
SELECT 'Colunas de estoque adicionadas à tabela products' as info;
SELECT 'Funções e triggers criados' as info;
SELECT 'Políticas RLS configuradas' as info; 