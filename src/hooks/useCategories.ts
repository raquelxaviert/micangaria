'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface Category {
  name: string;
  count: number;
  icon: string;
  href: string;
  type: string;
}

// Mapa completo de ícones para diferentes tipos de produtos
const typeIconMap: { [key: string]: { icon: string; displayName: string } } = {
  // Joias e Acessórios
  'anel': { icon: '💍', displayName: 'Anéis' },
  'colar': { icon: '📿', displayName: 'Colares' },
  'brinco': { icon: '💎', displayName: 'Brincos' },
  'pulseira': { icon: '⌚', displayName: 'Pulseiras' },
  'gargantilha': { icon: '🔗', displayName: 'Gargantilhas' },
  'piercing': { icon: '✨', displayName: 'Piercings' },
  
  // Bolsas e Carteiras
  'bolsa': { icon: '👜', displayName: 'Bolsas' },
  'carteira': { icon: '💳', displayName: 'Carteiras' },
  'mochila': { icon: '🎒', displayName: 'Mochilas' },
  'clutch': { icon: '👛', displayName: 'Clutches' },
  
  // Roupas Femininas
  'vestido': { icon: '👗', displayName: 'Vestidos' },
  'blusa': { icon: '👚', displayName: 'Blusas' },
  'camisa': { icon: '👕', displayName: 'Camisas' },
  'calca': { icon: '👖', displayName: 'Calças' },
  'saia': { icon: '🩱', displayName: 'Saias' },
  'shorts': { icon: '🩳', displayName: 'Shorts' },
  'jaqueta': { icon: '🧥', displayName: 'Jaquetas' },
  'casaco': { icon: '🧥', displayName: 'Casacos' },
  'blazer': { icon: '🥼', displayName: 'Blazers' },
  'cardigã': { icon: '🧶', displayName: 'Cardigãs' },
  'cardiga': { icon: '🧶', displayName: 'Cardigãs' },
  'top': { icon: '👙', displayName: 'Tops' },
  'cropped': { icon: '👚', displayName: 'Croppeds' },
  
  // Calçados
  'sapato': { icon: '👠', displayName: 'Sapatos' },
  'sandalia': { icon: '👡', displayName: 'Sandálias' },
  'bota': { icon: '🥾', displayName: 'Botas' },
  'tenis': { icon: '👟', displayName: 'Tênis' },
  'chinelo': { icon: '🩴', displayName: 'Chinelos' },
  'sapatilha': { icon: '🥿', displayName: 'Sapatilhas' },
  
  // Acessórios
  'cinto': { icon: '👔', displayName: 'Cintos' },
  'relogio': { icon: '⌚', displayName: 'Relógios' },
  'oculos': { icon: '🕶️', displayName: 'Óculos' },
  'chapeu': { icon: '👒', displayName: 'Chapéus' },
  'bone': { icon: '🧢', displayName: 'Bonés' },
  'cachecol': { icon: '🧣', displayName: 'Cachecóis' },
  'luva': { icon: '🧤', displayName: 'Luvas' },
  'gravata': { icon: '👔', displayName: 'Gravatas' },
  'laço': { icon: '🎀', displayName: 'Laços' },
  'hair': { icon: '💇‍♀️', displayName: 'Acessórios de Cabelo' },
  
  // Conjuntos
  'conjunto': { icon: '✨', displayName: 'Conjuntos' },
  'kit': { icon: '📦', displayName: 'Kits' },
  
  // Fallback para tipos não mapeados
  'default': { icon: '🛍️', displayName: 'Outros' }
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Buscar contagem de produtos por tipo
        const { data: products, error } = await supabase
          .from('products')
          .select('type')
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao carregar produtos para categorias:', error);
          // Fallback para categorias básicas
          setCategories([
            { name: 'Anéis', count: 0, icon: '💍', href: '/products?type=anel', type: 'anel' },
            { name: 'Bolsas', count: 0, icon: '👜', href: '/products?type=bolsa', type: 'bolsa' },
            { name: 'Colares', count: 0, icon: '📿', href: '/products?type=colar', type: 'colar' },
            { name: 'Brincos', count: 0, icon: '💎', href: '/products?type=brinco', type: 'brinco' },
          ]);
          return;
        }

        // Contar produtos por tipo
        const typeCounts: { [key: string]: number } = {};
        products?.forEach(product => {
          if (product.type) {
            typeCounts[product.type] = (typeCounts[product.type] || 0) + 1;
          }
        });

        // Criar categorias baseadas nos tipos encontrados
        const categoriesData: Category[] = Object.entries(typeCounts)
          .map(([type, count]) => {
            const typeInfo = typeIconMap[type] || typeIconMap['default'];
            return {
              name: typeInfo.displayName,
              count: count,
              icon: typeInfo.icon,
              href: `/products?type=${type}`,
              type: type
            };
          })
          .filter(category => category.count > 0) // Só mostrar categorias com produtos
          .sort((a, b) => b.count - a.count) // Ordenar por quantidade (maior para menor)
          .slice(0, 12); // Limitar a 12 categorias no menu

        setCategories(categoriesData);

      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Fallback em caso de erro
        setCategories([
          { name: 'Anéis', count: 0, icon: '💍', href: '/products?type=anel', type: 'anel' },
          { name: 'Bolsas', count: 0, icon: '👜', href: '/products?type=bolsa', type: 'bolsa' },
          { name: 'Colares', count: 0, icon: '📿', href: '/products?type=colar', type: 'colar' },
          { name: 'Brincos', count: 0, icon: '💎', href: '/products?type=brinco', type: 'brinco' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, isLoading };
}
