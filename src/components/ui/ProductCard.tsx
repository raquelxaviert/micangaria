'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LikeButton } from '@/components/ui/LikeButton';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingCart, Star } from 'lucide-react';

// Interface genérica para produto - suporta tanto Supabase quanto mock
export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  image_url?: string; // Supabase format
  type: string;
  style: string;
  colors?: string[];
  isNewArrival?: boolean;
  is_new_arrival?: boolean; // Supabase format
  isOnSale?: boolean;
  is_promotion?: boolean; // Supabase format
  promotionDetails?: string;
  promotion_details?: string; // Supabase format
}

interface ProductCardProps {
  product: ProductData;
  variant?: 'default' | 'compact' | 'detailed' | 'favorites';
  showActions?: boolean;
  showDescription?: boolean;
  showColors?: boolean;
  showRating?: boolean;
  className?: string;
}

export function ProductCard({ 
  product, 
  variant = 'default',
  showActions = true,
  showDescription = true,
  showColors = true,
  showRating = false,
  className = ""
}: ProductCardProps) {
  // Normalize product data to handle both formats
  const imageUrl = product.imageUrl || product.image_url || '/products/placeholder.jpg';
  const isNewArrival = product.isNewArrival || product.is_new_arrival || false;
  const isOnSale = product.isOnSale || product.is_promotion || false;
  const promotionDetails = product.promotionDetails || product.promotion_details;

  return (
    <Card className={`group hover:shadow-xl transition-all duration-500 overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 ${className}`}>
      <div className="relative overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          width={400}
          height={400}          className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
            variant === 'compact' ? 'h-40 sm:h-48' : 'h-72'
          }`}
        />
        
        {/* Badges superior esquerdo */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNewArrival && (
            <Badge className="bg-green-500 text-white font-semibold px-3 py-1 shadow-lg">
              NOVO
            </Badge>
          )}
          {isOnSale && (
            <Badge className="bg-red-500 text-white font-semibold px-3 py-1 shadow-lg">
              {promotionDetails || 'OFERTA'}
            </Badge>
          )}
        </div>

        {/* Botão de Like superior direito */}
        <LikeButton 
          productId={product.id} 
          variant="floating"
          size="md"
        />        {/* Overlay gradient em detailed */}
        {(variant === 'detailed' || variant === 'favorites') && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      <CardContent className={`space-y-2 sm:space-y-4 ${variant === 'compact' ? 'p-2 sm:p-3' : 'p-5'}`}>        {/* Tags/cores do produto */}
        {showColors && product.colors && product.colors.length > 0 && variant !== 'compact' && (
          <div className="flex flex-wrap gap-2">
            {product.colors.slice(0, 3).map((color: string) => (
              <span 
                key={color}
                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-colors"
              >
                {color}
              </span>
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        )}        {/* Badges de tipo e estilo */}
        {variant !== 'compact' && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              {product.type}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize">
              {product.style}
            </Badge>
          </div>
        )}        {/* Nome do produto */}
        <h3 className={`font-semibold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 ${
          variant === 'compact' ? 'text-sm sm:text-base' : 'text-lg'
        }`}>
          {product.name}
        </h3>        {/* Descrição */}
        {showDescription && variant !== 'compact' && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}{/* Rating (para variantes detailed e favorites) */}
        {showRating && (variant === 'detailed' || variant === 'favorites') && (
          <div className="flex items-center gap-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        )}        {/* Preços */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-primary ${
              variant === 'compact' ? 'text-lg sm:text-xl' : 'text-2xl'
            }`}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>        {/* Botões de ação */}
        {showActions && (
          <div className={`flex gap-1 sm:gap-2 pt-1 sm:pt-2 ${variant === 'detailed' ? 'flex-col' : ''}`}>
            <Button 
              asChild
              variant="outline" 
              size="sm"
              className={`flex-1 hover:bg-primary hover:text-white transition-colors duration-300 ${
                variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs'
              }`}
            >
              <Link href={`/products/${product.id}`}>
                <Eye className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Ver Detalhes</span>
                <span className="sm:hidden">Ver</span>
              </Link>
            </Button>
            <Button 
              size="sm"
              className={`flex-1 bg-primary hover:bg-primary/90 transition-colors duration-300 ${
                variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs'
              }`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
