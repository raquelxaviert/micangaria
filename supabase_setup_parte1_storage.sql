-- PARTE 1: APENAS STORAGE (SEM OPERAÇÕES DESTRUCTIVE)
-- Execute esta parte primeiro no Supabase

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Imagens públicas para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins podem fazer upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins podem atualizar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins podem deletar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Adicionar colunas para storage se não existirem
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_storage_path TEXT,
ADD COLUMN IF NOT EXISTS gallery_storage_paths TEXT[];

-- Verificar bucket criado
SELECT * FROM storage.buckets WHERE id = 'product-images';
