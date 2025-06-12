-- Migration: criar tabela de pedidos (orders) antes de adicionar campos de frete

-- Habilitar extensão de UUID (se ainda não estiver ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  preference_id TEXT UNIQUE,
  init_point TEXT,
  sandbox_init_point TEXT,
  total NUMERIC(10, 2) NOT NULL,
  breakdown JSONB NOT NULL,
  items JSONB NOT NULL,
  shipping_option JSONB,
  shipment_id TEXT,
  label_url TEXT,
  tracking_code TEXT,
  shipping_status TEXT,
  status TEXT DEFAULT 'pending'
);
