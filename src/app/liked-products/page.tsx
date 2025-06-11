'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Tag, Zap, Star, Heart, ShoppingBag } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContextSupabase';
import { LikeButton } from '@/components/ui/LikeButton';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { createClient } from '@/lib/supabase/client';

// Interface para produto do Supabase
interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  type: string;
  style: string;
  colors: string[];
  is_new_arrival?: boolean;
  is_promotion?: boolean;
  promotion_details?: string;
}

function LikedProductCard({ product }: { product: SupabaseProduct }) {
  return (
    <Card className="group flex flex-col h-full shadow-md hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden bg-card border-0 hover:-translate-y-2">
      <CardHeader className="relative p-0">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={product.image_url || '/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_new_arrival && (
              <Badge className="bg-green-600 text-white font-bold shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                NOVO
              </Badge>
            )}
            {product.is_promotion && (
              <Badge className="bg-red-600 text-white font-bold shadow-lg animate-pulse">
                <Tag className="w-3 h-3 mr-1" />
                OFERTA
              </Badge>
            )}
          </div>
          
          {/* Heart Icon - Always visible and filled for liked products */}
          <LikeButton 
            productId={product.id} 
            className="opacity-100"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {product.type}
          </Badge>
          <Badge variant="secondary" className="text-xs capitalize">
            {product.style}
          </Badge>
        </div>
        
        <CardTitle className="text-lg sm:text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
          {product.name}
        </CardTitle>
        
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            R$ {product.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 sm:p-6 pt-0">
        <Button asChild className="w-full group/btn">
          <Link href={`/products/${product.id}`}>
            Ver Detalhes
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function LikedProductsContent() {
  const { getLikedProducts, isLoaded, likedCount } = useLikes();
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
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
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {likedProducts.map(product => (
              <LikedProductCard key={product.id} product={product} />
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
