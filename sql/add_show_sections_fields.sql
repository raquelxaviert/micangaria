-- Adicionar campos para controlar a exibição das seções materiais e cuidados
-- na página de produto

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS show_materials_section boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_care_section boolean DEFAULT true;

-- Comentários para documentação
COMMENT ON COLUMN public.products.show_materials_section IS 'Controla se a seção de materiais será exibida na página do produto';
COMMENT ON COLUMN public.products.show_care_section IS 'Controla se a seção de cuidados será exibida na página do produto';

-- Atualizar produtos existentes para mostrar as seções por padrão
UPDATE public.products 
SET 
  show_materials_section = true,
  show_care_section = true
WHERE 
  show_materials_section IS NULL 
  OR show_care_section IS NULL;

-- Verificar os dados atualizados
SELECT 
  id,
  name,
  show_materials_section,
  show_care_section,
  materials IS NOT NULL as has_materials,
  care_instructions IS NOT NULL as has_care_instructions
FROM public.products 
LIMIT 5;
