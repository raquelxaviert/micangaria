-- Atualizar estrutura da tabela orders para incluir campos necessários

-- Adicionar campos que podem estar faltando
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS customer_info JSONB,
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

-- Remover campo breakdown se não estiver sendo usado
-- ALTER TABLE orders DROP COLUMN IF EXISTS breakdown;

-- Atualizar comentários para documentar a estrutura
COMMENT ON TABLE orders IS 'Tabela de pedidos da loja';
COMMENT ON COLUMN orders.items IS 'Array de itens do pedido com informações do produto incluindo imageUrl';
COMMENT ON COLUMN orders.customer_info IS 'Informações do cliente (nome, email, telefone, CPF)';
COMMENT ON COLUMN orders.shipping_address IS 'Endereço de entrega completo';
COMMENT ON COLUMN orders.shipping_option IS 'Opção de frete selecionada';
COMMENT ON COLUMN orders.payment_status IS 'Status do pagamento (pending, paid, failed, cancelled)';
COMMENT ON COLUMN orders.status IS 'Status geral do pedido (pending, paid, shipped, delivered, cancelled)'; 