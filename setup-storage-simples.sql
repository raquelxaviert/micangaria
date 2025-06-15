-- Script SIMPLIFICADO - Execute apenas isto no SQL Editor

-- Criar bucket público (mais simples possível)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Verificar se foi criado
SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';

-- IMPORTANTE: Se este script funcionar mas o upload ainda falhar,
-- vá na interface do Supabase:
-- Storage > product-images > Settings > Make sure "Public" is enabled
