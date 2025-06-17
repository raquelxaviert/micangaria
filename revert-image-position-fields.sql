-- SQL para reverter os campos de posicionamento de imagem
-- Execute este script para remover os campos image_position_x e image_position_y da tabela products

-- Remover os campos de posicionamento da imagem de capa
ALTER TABLE products 
DROP COLUMN IF EXISTS image_position_x,
DROP COLUMN IF EXISTS image_position_y;

-- Os campos foram removidos com sucesso
-- Não há mais controle de posicionamento da imagem de capa nos cards mobile
