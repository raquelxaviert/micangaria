-- Script SQL MÍNIMO (se quiser tentar via SQL ainda)
-- Execute APENAS este comando no SQL Editor

-- Deletar bucket se existir (cuidado: remove todos os arquivos)
DELETE FROM storage.buckets WHERE id = 'product-images';

-- Criar bucket público simples
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('product-images', 'product-images', true, 52428800);

-- Verificar se foi criado
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'product-images';

-- NOTA: Este script pode falhar se você não tiver permissões
-- Se falhar, use a interface conforme instruções em SOLUCAO-DEFINITIVA-STORAGE.md
