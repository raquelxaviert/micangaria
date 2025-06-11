'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useCollections, { CollectionProduct } from '@/hooks/useCollections';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';

interface CollectionSectionProps {
  collectionSlug: string;
  title?: string;
  badgeText?: string;
  badgeColor?: string;
  description?: string;
  showViewAllButton?: boolean;
  maxProducts?: number;
}

const ProductCard = ({ product }: { product: CollectionProduct }) => (
  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
    <div className="relative">
      <Image
        src={product.imageUrl || '/products/placeholder.jpg'}
        alt={product.name}
        width={400}
        height={400}
        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {product.isNewArrival && (
        <Badge className="absolute top-3 left-3 bg-green-500 text-white">
          NOVO
        </Badge>
      )}
      {product.isOnSale && (
        <Badge className="absolute top-3 left-3 bg-red-500 text-white">
          OFERTA
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full"
      >
        <Heart className="w-4 h-4" />
      </Button>
    </div>
    <CardContent className="p-4 space-y-3">
      <div className="flex gap-2">
        {product.colors.slice(0, 3).map((color: string) => (
          <span 
            key={color}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
          >
            {color}
          </span>
        ))}
      </div>
      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
        {product.name}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {product.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </span>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs capitalize">
            {product.type}
          </Badge>
          <Badge variant="secondary" className="text-xs capitalize">
            {product.style}
          </Badge>
        </div>
      </div>
      <Button className="w-full">
        <ShoppingBag className="w-4 h-4 mr-2" />
        Ver Detalhes
      </Button>
    </CardContent>
  </Card>
);

export default function CollectionSection({
  collectionSlug,
  title,
  badgeText,
  badgeColor,
  description,
  showViewAllButton = true,
  maxProducts = 5
}: CollectionSectionProps) {
  const { getCollectionBySlug, getCollectionProducts, isLoading } = useCollections();
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [collection, setCollection] = useState<any>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  useEffect(() => {
    const loadCollectionData = async () => {
      if (isLoading) return;
      
      setProductsLoading(true);
      
      // Buscar dados da coleção
      const collectionData = getCollectionBySlug(collectionSlug);
      setCollection(collectionData);
      
      // Buscar produtos da coleção
      const collectionProducts = await getCollectionProducts(collectionSlug);
      setProducts(collectionProducts.slice(0, maxProducts));
      
      setProductsLoading(false);
    };

    loadCollectionData();
  }, [collectionSlug, maxProducts, isLoading]); // Removidas as funções das dependências

  // Não renderizar se não há produtos ou dados
  if (isLoading || productsLoading || !collection || products.length === 0) {
    return (
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            {isLoading || productsLoading ? (
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <p>Nenhum produto encontrado para esta coleção.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  const displayTitle = title || collection.name;
  const displayBadgeText = badgeText || collection.name;
  const displayDescription = description || collection.description;
  const displayBadgeColor = badgeColor || collection.color;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <Badge 
            className="mb-4 sm:mb-6 text-white border-0"
            style={{ backgroundColor: displayBadgeColor }}
          >
            {displayBadgeText}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
            {displayTitle}
          </h2>
          {displayDescription && (
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {displayDescription}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {showViewAllButton && (
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href={`/collections/${collectionSlug}`}>
                Ver Toda Coleção
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
