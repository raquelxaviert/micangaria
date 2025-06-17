-- Adicionar campos de posicionamento da imagem de capa no card mobile
-- Esses campos armazenam a posição X e Y (em porcentagem 0-100) 
-- da propriedade object-position CSS para o preview mobile

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_position_x NUMERIC DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS image_position_y NUMERIC DEFAULT 50.0;

-- Comentários das colunas para documentação
COMMENT ON COLUMN products.image_position_x IS 'Posição horizontal (0-100%) da imagem de capa no card mobile';
COMMENT ON COLUMN products.image_position_y IS 'Posição vertical (0-100%) da imagem de capa no card mobile';

-- Valores padrão centram a imagem (50%, 50%)
-- Usuário pode ajustar através do preview no admin para melhor enquadramento
