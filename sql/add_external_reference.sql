-- Adicionar coluna external_reference para uso no webhook do Mercado Pago
-- Esta coluna permitirá identificar o pedido através do external_reference enviado pelo webhook

ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_reference TEXT;

-- Criar índice para busca rápida por external_reference
CREATE INDEX IF NOT EXISTS idx_orders_external_reference ON orders(external_reference);

-- Comentários para documentação
COMMENT ON COLUMN orders.external_reference IS 'ID de referencia externa usado no Mercado Pago para identificar o pedido no webhook';
