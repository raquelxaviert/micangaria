'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContextSupabase';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ProductCard, ProductData } from '@/components/ui/ProductCard';

function LikedProductsContent() {
  const { getLikedProducts, isLoaded, likedCount } = useLikes();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Buscar produtos do Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao buscar produtos:', error);
          return;
        }

        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Erro ao conectar com Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [supabase]);

  const likedProducts = useMemo(() => {
    if (!isLoaded || loading) return [];
    const likedIds = getLikedProducts();
    
    console.log('🔍 Página favoritos - dados Supabase:', {
      isLoaded,
      loading,
      likedCount,
      likedIds,
      totalProducts: products.length,
      firstFewProductIds: products.slice(0, 5).map(p => ({ id: p.id, name: p.name }))
    });
    
    const filtered = products.filter(product => likedIds.includes(product.id));
    console.log('🔍 Produtos filtrados:', filtered.map(p => ({ id: p.id, name: p.name })));
    
    return filtered;
  }, [getLikedProducts, isLoaded, likedCount, products, loading]);
  // Show loading state while checking localStorage and Supabase
  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline text-primary">
            Meus Favoritos
          </h1>        </div>        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {likedCount > 0 
            ? `Você tem ${likedCount} ${likedCount === 1 ? 'produto favorito' : 'produtos favoritos'} salvos`
            : 'Seus produtos favoritos aparecerão aqui'
          }
        </p>
      </div>

      {/* Content */}
      {likedProducts.length > 0 ? (
        <>          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {likedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variant="detailed"
                showRating={true}
              />
            ))}
          </div>

          {/* Back to products */}
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/products">
                <ShoppingBag className="w-5 h-5" />
                Continuar Comprando
              </Link>
            </Button>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Nenhum favorito ainda
            </h2>
            <p className="text-muted-foreground mb-8">
              Comece a explorar nossa coleção e salve seus produtos favoritos clicando no ícone de coração.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/products">
                <ShoppingBag className="w-5 h-5" />
                Explorar Produtos
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Disable SSR for this page
export const dynamic = 'force-dynamic';

export default function LikedProductsPage() {
  return (
    <ClientOnly fallback={
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <LikedProductsContent />
    </ClientOnly>
  );
}
