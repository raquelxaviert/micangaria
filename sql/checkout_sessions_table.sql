-- Tabela para salvar progresso do checkout
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  user_id UUID NOT NULL,
  step TEXT NOT NULL DEFAULT 'customer',
  cart_items JSONB NOT NULL,
  customer_data JSONB NULL,
  shipping_address JSONB NULL,
  shipping_option JSONB NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  
  CONSTRAINT checkout_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT checkout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON public.checkout_sessions USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON public.checkout_sessions USING btree (expires_at) TABLESPACE pg_default;

-- RLS (Row Level Security)
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados
CREATE POLICY "Usuários podem gerenciar suas próprias sessões" ON public.checkout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Função para limpar sessões expiradas (opcional)
CREATE OR REPLACE FUNCTION public.cleanup_expired_checkout_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.checkout_sessions 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
