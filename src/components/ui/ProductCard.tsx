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
    <Link href={`/products/${product.id}`} className="block">
      <Card className={`group hover:shadow-xl transition-all duration-500 overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 cursor-pointer ${className}`}>
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
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNewArrival && (
            <Badge className={`bg-green-500 text-white font-medium shadow-md ${
              variant === 'compact' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1'
            }`}>
              NOVO
            </Badge>
          )}
          {isOnSale && (
            <Badge className={`bg-red-500 text-white font-medium shadow-md ${
              variant === 'compact' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1'
            }`}>
              {variant === 'compact' ? 'OFERTA' : (promotionDetails || 'OFERTA')}
            </Badge>
          )}
        </div>

        {/* Botão de Like superior direito */}
        <LikeButton 
          productId={product.id} 
          variant="floating"
          size={variant === 'compact' ? 'sm' : 'md'}
        />{/* Overlay gradient em detailed */}
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
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs capitalize px-2 py-0.5">
              {product.type}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize px-2 py-0.5">
              {product.style}
            </Badge>
          </div>
        )}{/* Nome do produto */}
        <h3 className={`font-semibold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 ${
          variant === 'compact' ? 'text-sm sm:text-base' : 'text-lg'
        }`}>
          {product.name}
        </h3>        {/* Descrição */}
        {showDescription && (
          <p className={`text-muted-foreground line-clamp-2 leading-relaxed ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}>
            {product.description}
          </p>
        )}{/* Rating (para variantes detailed e favorites) */}
        {showRating && (variant === 'detailed' || variant === 'favorites') && (
          <div className="flex items-center gap-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        )}        {/* Preços e botão de adicionar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <span className={`font-bold text-primary ${
              variant === 'compact' ? 'text-base sm:text-lg' : 'text-2xl'
            }`}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          {showActions && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Aqui você pode adicionar a lógica de adicionar ao carrinho
                console.log('Produto adicionado ao carrinho:', product.id);
              }}
              className={`bg-primary hover:bg-primary/90 transition-colors duration-300 ${
                variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs px-3 py-2'
              }`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">+</span>
            </Button>
          )}        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
