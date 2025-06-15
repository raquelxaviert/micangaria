-- Configuração SEGURA do Supabase Storage (alternativa)
-- Se você preferir ter controle de acesso mais restrito

-- 1. Criar o bucket 'product-images' (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  false, -- privado
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Políticas mais restritivas (apenas para usuários autenticados)

-- SELECT: Qualquer um pode visualizar
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- INSERT: Apenas usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images');

-- UPDATE: Apenas usuários autenticados podem atualizar
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'product-images');

-- DELETE: Apenas usuários autenticados podem deletar
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'product-images');

-- 3. Ativar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
