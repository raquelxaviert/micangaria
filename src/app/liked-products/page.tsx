'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products, Product } from '@/lib/ruge-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Tag, Zap, Star, Heart, ShoppingBag } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { LikeButton } from '@/components/ui/LikeButton';

function LikedProductCard({ product }: { product: Product }) {
  return (
    <Card className="group flex flex-col h-full shadow-md hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden bg-card border-0 hover:-translate-y-2">
      <CardHeader className="p-0 relative overflow-hidden">
        <div className="aspect-square relative w-full overflow-hidden rounded-t-xl">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            data-ai-hint={product.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNewArrival && (
              <Badge className="bg-accent text-accent-foreground font-bold shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                NOVO
              </Badge>
            )}
            {product.isPromotion && (
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
        
        <CardTitle className="text-lg sm:text-xl font-headline text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
          {product.name}
        </CardTitle>
        
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </CardDescription>
        
        <div className="flex items-center justify-between pt-2">
          <p className="text-xl sm:text-2xl font-bold text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        </div>

        {product.isPromotion && product.promotionDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-red-800 font-medium flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              {product.promotionDetails}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 sm:p-6 pt-0">
        <Button 
          asChild 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all duration-300 group-hover:bg-primary/80"
        >
          <Link href={`/products#${product.id}`}>
            Ver Detalhes
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function LikedProductsPage() {
  const { getLikedProducts, isLoaded, likedCount } = useLikes();
  
  const likedProducts = useMemo(() => {
    if (!isLoaded) return [];
    const likedIds = getLikedProducts();
    return products.filter(product => likedIds.includes(product.id));
  }, [getLikedProducts, isLoaded]);

  // Show loading state while checking localStorage
  if (!isLoaded) {
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
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
