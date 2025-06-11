'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const supabase = createClient();

interface Category {
  name: string;
  icon: string;
  href: string;
  count: number;
  type: string;
}

// Mapa de ícones para diferentes tipos de produtos
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
  'lenco': { icon: '🎀', displayName: 'Lenços' },
  'faixa': { icon: '🎀', displayName: 'Faixas' },
  'tiara': { icon: '👑', displayName: 'Tiaras' },
  
  // Conjunto e Outros
  'conjunto': { icon: '✨', displayName: 'Conjuntos' },
  'acessorio': { icon: '💫', displayName: 'Acessórios' },
  'necessaire': { icon: '💄', displayName: 'Necessaires' },
  'porta-joias': { icon: '💎', displayName: 'Porta-joias' },
  'decoracao': { icon: '🏠', displayName: 'Decoração' },
  
  // Fallback para tipos não mapeados
  'default': { icon: '🛍️', displayName: 'Outros' }
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadCategoryCounts = async () => {
      try {
        setIsLoading(true);

        // Buscar contagem de produtos por tipo
        const { data: products, error } = await supabase
          .from('products')
          .select('type')
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao carregar produtos:', error);
          // Fallback para dados mock
          setCategories([
            { name: 'Anéis', count: 0, icon: '💍', href: '/products?type=anel', type: 'anel' },
            { name: 'Bolsas', count: 0, icon: '👜', href: '/products?type=bolsa', type: 'bolsa' },
            { name: 'Colares', count: 0, icon: '📿', href: '/products?type=colar', type: 'colar' },
            { name: 'Conjuntos', count: 0, icon: '✨', href: '/products?type=conjunto', type: 'conjunto' }
          ]);
          setIsLoading(false);
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
          .sort((a, b) => b.count - a.count); // Ordenar por quantidade (maior para menor)

        console.log('📂 Categorias encontradas:', categoriesData.map(c => `${c.icon} ${c.name}: ${c.count}`));
        setCategories(categoriesData);

      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Fallback para dados mock em caso de erro
        setCategories([
          { name: 'Anéis', count: 0, icon: '💍', href: '/products?type=anel', type: 'anel' },
          { name: 'Bolsas', count: 0, icon: '👜', href: '/products?type=bolsa', type: 'bolsa' },
          { name: 'Colares', count: 0, icon: '📿', href: '/products?type=colar', type: 'colar' },
          { name: 'Conjuntos', count: 0, icon: '✨', href: '/products?type=conjunto', type: 'conjunto' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryCounts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Explore por Categoria
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Encontre Seu Estilo
            </p>
            <p className="text-muted-foreground mt-2">
              Navegue pelas nossas categorias cuidadosamente organizadas e descubra peças únicas que combinam com sua personalidade.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 bg-gradient-to-br from-card to-primary/5">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center space-y-2 sm:space-y-4">
                  <div className="h-12 w-12 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
            Explore por Categoria
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Encontre Seu Estilo
          </p>
          <p className="text-muted-foreground mt-2">
            Navegue pelas nossas categorias cuidadosamente organizadas e descubra peças únicas que combinam com sua personalidade.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => (
            <Card key={category.name} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br from-card to-primary/5 border-0">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center space-y-2 sm:space-y-4">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-headline text-sm sm:text-base lg:text-xl text-primary group-hover:text-primary/80 transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {category.count} produtos
                </p>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 text-xs sm:text-sm"
                >
                  <Link href={category.href}>
                    <span className="hidden sm:inline">Ver Todos</span>
                    <span className="sm:hidden">Ver</span>
                    <ArrowRight className="ml-1 sm:ml-2 w-3 sm:w-4 h-3 sm:h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
