-- Adicionar campos faltantes na tabela orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_info JSONB,
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
ADD COLUMN IF NOT EXISTS label_id TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_preference_id ON orders(preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Comentários para documentação
COMMENT ON COLUMN orders.customer_info IS 'Dados do cliente (nome, email, telefone, documento)';
COMMENT ON COLUMN orders.shipping_address IS 'Endereço de entrega completo';
COMMENT ON COLUMN orders.payment_id IS 'ID do pagamento no Mercado Pago';
COMMENT ON COLUMN orders.label_id IS 'ID da etiqueta gerada no Melhor Envio';
