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
            { name: 'Acessórios', count: 0, icon: '💎', href: '/products?category=acessorios', type: 'acessorio' },
            { name: 'Bolsas', count: 0, icon: '👜', href: '/products?category=bolsas', type: 'bolsa' },
            { name: 'Conjuntos', count: 0, icon: '✨', href: '/products?category=conjuntos', type: 'conjunto' }
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

        // Mapear para categorias
        const categoriesData: Category[] = [
          { 
            name: 'Acessórios', 
            count: (typeCounts['acessorio'] || 0) + (typeCounts['anel'] || 0) + (typeCounts['brinco'] || 0) + (typeCounts['pulseira'] || 0) + (typeCounts['colar'] || 0) + (typeCounts['cinto'] || 0) + (typeCounts['sandalia'] || 0), 
            icon: '💎', 
            href: '/products?category=acessorios',
            type: 'acessorio'
          },
          { 
            name: 'Bolsas', 
            count: typeCounts['bolsa'] || 0, 
            icon: '👜', 
            href: '/products?category=bolsas',
            type: 'bolsa'
          },
          { 
            name: 'Conjuntos', 
            count: typeCounts['conjunto'] || 0, 
            icon: '✨', 
            href: '/products?category=conjuntos',
            type: 'conjunto'
          }
        ];

        setCategories(categoriesData);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Fallback
        setCategories([
          { name: 'Acessórios', count: 0, icon: '💎', href: '/products?category=acessorios', type: 'acessorio' },
          { name: 'Bolsas', count: 0, icon: '👜', href: '/products?category=bolsas', type: 'bolsa' },
          { name: 'Conjuntos', count: 0, icon: '✨', href: '/products?category=conjuntos', type: 'conjunto' }
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
