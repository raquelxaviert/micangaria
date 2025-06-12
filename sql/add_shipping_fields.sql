-- Migration: adicionar campos de frete e envio na tabela de pedidos
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_option JSONB,
  ADD COLUMN IF NOT EXISTS shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS label_url TEXT,
  ADD COLUMN IF NOT EXISTS tracking_code TEXT,
  ADD COLUMN IF NOT EXISTS shipping_status TEXT;
