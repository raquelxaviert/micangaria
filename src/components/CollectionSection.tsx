'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useCollections, { CollectionProduct } from '@/hooks/useCollections';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, ShoppingBag, Eye, ShoppingCart, Star, Truck } from 'lucide-react';
import { LikeButton } from '@/components/ui/LikeButton';
import { ProductCard } from '@/components/ui/ProductCard';

interface CollectionSectionProps {
  collectionSlug: string;
  title?: string;
  badgeText?: string;
  badgeColor?: string;
  description?: string;
  showViewAllButton?: boolean;
  maxProducts?: number;
}

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
        <div className="container mx-auto px-2 sm:px-6">
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
  const displayDescription = description || collection.description;  const displayBadgeColor = badgeColor || collection.color;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-2 sm:px-6">
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
        </div>          <div className="columns-2 lg:columns-4 xl:columns-4 gap-2 sm:gap-4 lg:gap-6 space-y-2 sm:space-y-4 lg:space-y-6 mb-12">
          {products.map((product) => (
            <div key={product.id} className="break-inside-avoid mb-2 sm:mb-4 lg:mb-6">
              <ProductCard product={product} variant="compact" />
            </div>
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
