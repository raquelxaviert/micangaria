'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Gem, 
  Heart, 
  Sparkles, 
  Briefcase, 
  CreditCard, 
  Backpack,
  Shirt,
  Crown,
  Watch,
  Glasses,
  Anchor,
  Circle,
  Star,
  Gift,
  ShoppingBag,
  Package,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

const supabase = createClient();

interface Category {
  name: string;
  count: number;
  icon: any; // Componente do Lucide React
  href: string;
  type: string;
}

// Mapa completo de ícones para diferentes tipos de produtos
const typeIconMap: { [key: string]: { icon: any; displayName: string } } = {
  // Joias e Acessórios
  'anel': { icon: Gem, displayName: 'Anéis' },
  'colar': { icon: Heart, displayName: 'Colares' },
  'brinco': { icon: Sparkles, displayName: 'Brincos' },
  'pulseira': { icon: Watch, displayName: 'Pulseiras' },
  'gargantilha': { icon: Anchor, displayName: 'Gargantilhas' },
  'piercing': { icon: Star, displayName: 'Piercings' },  
  // Bolsas e Carteiras
  'bolsa': { icon: Briefcase, displayName: 'Bolsas' },
  'carteira': { icon: CreditCard, displayName: 'Carteiras' },
  'mochila': { icon: Backpack, displayName: 'Mochilas' },
  'clutch': { icon: Package, displayName: 'Clutches' },
  
  // Roupas Femininas
  'vestido': { icon: Crown, displayName: 'Vestidos' },
  'blusa': { icon: Shirt, displayName: 'Blusas' },
  'camisa': { icon: Shirt, displayName: 'Camisas' },
  'calca': { icon: Shirt, displayName: 'Calças' },
  'saia': { icon: Crown, displayName: 'Saias' },
  'shorts': { icon: Shirt, displayName: 'Shorts' },
  'jaqueta': { icon: Shirt, displayName: 'Jaquetas' },
  'casaco': { icon: Shirt, displayName: 'Casacos' },
  'blazer': { icon: Shirt, displayName: 'Blazers' },
  'cardigã': { icon: Shirt, displayName: 'Cardigãs' },
  'cardiga': { icon: Shirt, displayName: 'Cardigãs' },
  'top': { icon: Shirt, displayName: 'Tops' },
  'cropped': { icon: Shirt, displayName: 'Croppeds' },
  
  // Calçados
  'sapato': { icon: Anchor, displayName: 'Sapatos' },
  'sandalia': { icon: Anchor, displayName: 'Sandálias' },
  'bota': { icon: Anchor, displayName: 'Botas' },
  'tenis': { icon: Anchor, displayName: 'Tênis' },
  'chinelo': { icon: Anchor, displayName: 'Chinelos' },
  'sapatilha': { icon: Anchor, displayName: 'Sapatilhas' },  // Acessórios
  'cinto': { icon: Circle, displayName: 'Cintos' },
  'relogio': { icon: Watch, displayName: 'Relógios' },
  'oculos': { icon: Glasses, displayName: 'Óculos' },
  'chapeu': { icon: Crown, displayName: 'Chapéus' },
  'bone': { icon: Crown, displayName: 'Bonés' },
  'cachecol': { icon: Gift, displayName: 'Cachecóis' },
  'luva': { icon: Gift, displayName: 'Luvas' },
  'gravata': { icon: Gift, displayName: 'Gravatas' },
  'laço': { icon: Gift, displayName: 'Laços' },
  'hair': { icon: Crown, displayName: 'Acessórios de Cabelo' },
    // Conjuntos
  'conjunto': { icon: Gift, displayName: 'Conjuntos' },
  'kit': { icon: Package, displayName: 'Kits' },
  
  // Tipos adicionais comuns
  'acessorio': { icon: Star, displayName: 'Acessórios' },
  'joia': { icon: Gem, displayName: 'Joias' },
  'bijuteria': { icon: Sparkles, displayName: 'Bijuterias' },
  'presente': { icon: Gift, displayName: 'Presentes' },
  'decoracao': { icon: Sun, displayName: 'Decoração' },  'casa': { icon: Moon, displayName: 'Casa' },
  'vintage': { icon: Crown, displayName: 'Vintage' },
  'retro': { icon: Zap, displayName: 'Retrô' }
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
          .eq('is_active', true);        if (error) {
          console.error('Erro ao carregar produtos para categorias:', error);
          // Fallback para categorias básicas
          setCategories([
            { name: 'Anéis', count: 0, icon: Gem, href: '/products?type=anel', type: 'anel' },
            { name: 'Bolsas', count: 0, icon: Briefcase, href: '/products?type=bolsa', type: 'bolsa' },
            { name: 'Colares', count: 0, icon: Heart, href: '/products?type=colar', type: 'colar' },
            { name: 'Brincos', count: 0, icon: Sparkles, href: '/products?type=brinco', type: 'brinco' },
          ]);
          return;
        }

        // Contar produtos por tipo
        const typeCounts: { [key: string]: number } = {};
        products?.forEach(product => {
          if (product.type) {
            typeCounts[product.type] = (typeCounts[product.type] || 0) + 1;
          }
        });        // Criar categorias baseadas nos tipos encontrados
        const categoriesData: Category[] = Object.entries(typeCounts)
          .map(([type, count]) => {
            const typeInfo = typeIconMap[type];
            // Se não encontrar o tipo no mapa, usa o ícone de brilhinho mas mantém o nome real do tipo
            if (!typeInfo) {
              return {
                name: type, // Usa o nome real do tipo do banco
                count: count,
                icon: Sparkles, // Ícone de fallback (brilhinho)
                href: `/products?type=${type}`,
                type: type
              };
            }
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
        console.error('Erro ao carregar categorias:', error);          // Fallback em caso de erro
          setCategories([
            { name: 'Anéis', count: 0, icon: Gem, href: '/products?type=anel', type: 'anel' },
            { name: 'Bolsas', count: 0, icon: Briefcase, href: '/products?type=bolsa', type: 'bolsa' },
            { name: 'Colares', count: 0, icon: Heart, href: '/products?type=colar', type: 'colar' },
            { name: 'Brincos', count: 0, icon: Sparkles, href: '/products?type=brinco', type: 'brinco' },
          ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, isLoading };
}
