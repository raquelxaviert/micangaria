'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LikeButton } from '@/components/ui/LikeButton';
import { FastImage } from '@/components/ui/FastImage';
import Link from 'next/link';
import { Eye, ShoppingCart, Star } from 'lucide-react';
import { CartManager } from '@/lib/ecommerce';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

// Interface genérica para produto - suporta tanto Supabase quanto mock
export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  image_url?: string; // Supabase format
  gallery_urls?: string[]; // Supabase multiple images
  type: string;
  style: string;
  colors?: string[];  materials?: string[]; // Materiais do produto
  sizes?: string[]; // Tamanhos disponíveis
  isNewArrival?: boolean;
  is_new_arrival?: boolean; // Supabase format
  isOnSale?: boolean;
  is_on_sale?: boolean; // Supabase format
  is_promotion?: boolean; // Supabase format
  promotionDetails?: string;
  promotion_details?: string; // Supabase format
  
  // Badge display configuration
  show_colors_badge?: boolean;
  show_materials_badge?: boolean;
  show_sizes_badge?: boolean;
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
}: ProductCardProps) {  // Normalize product data to handle both formats
  const imageUrl = (product.gallery_urls && product.gallery_urls.length > 0) 
    ? product.gallery_urls[0] 
    : product.imageUrl || product.image_url || '/products/placeholder.jpg';
  const isNewArrival = product.isNewArrival || product.is_new_arrival || false;
  const isOnSale = product.isOnSale || product.is_on_sale || product.is_promotion || false;
  const promotionDetails = product.promotionDetails || product.promotion_details;
  
  // Get total number of images for indicator
  const totalImages = 1 + (Array.isArray(product.gallery_urls) ? product.gallery_urls.length : 0);
    // Otimizar URL da imagem para o tamanho do card
  const optimizedImageUrl = getOptimizedImageUrl(imageUrl, IMAGE_CONFIGS.card);
  return (
    <Card className={`group hover:shadow-xl transition-all duration-500 overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 w-full ${className}`}>
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block cursor-pointer">          <div className="relative overflow-hidden">            <FastImage
              src={optimizedImageUrl}
              alt={product.name}
              width={400}
              height={400}
              className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                variant === 'compact' ? 'h-40 sm:h-48' : 'h-72'
              }`}
              quality={85}
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
            </div>            {/* Multiple images indicator */}
            {totalImages > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <span>{totalImages}</span>
                </div>
              </div>
            )}

            {/* Overlay gradient em detailed */}
            {(variant === 'detailed' || variant === 'favorites') && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
          </div>
        </Link>

        {/* Botão de Like superior direito - fora do link */}
        <div className="absolute top-2 right-2 z-10">
          <LikeButton 
            productId={product.id} 
            variant="floating"
            size={variant === 'compact' ? 'sm' : 'md'}
          />
        </div>
      </div>

      <CardContent className={`space-y-2 sm:space-y-4 ${variant === 'compact' ? 'p-2 sm:p-3' : 'p-5'}`}>        <Link href={`/products/${product.id}`} className="block cursor-pointer">          {/* Todos os badges inline em uma única linha */}
          <div className="flex items-center gap-1 flex-wrap mb-2">
            {/* Badge de Material (primeiro material) - apenas se configurado para mostrar */}
            {product.show_materials_badge === true && product.materials && product.materials.length > 0 && (              <Badge variant="outline" className={`capitalize text-xs leading-none ${
                variant === 'compact' ? 'px-1.5 py-0.5 h-5' : 'px-2 py-1 h-6'
              }`}>
                {product.materials[0]}
              </Badge>
            )}
            
            {/* Badge de Tamanho (primeiro tamanho) - apenas se configurado para mostrar */}
            {product.show_sizes_badge === true && product.sizes && product.sizes.length > 0 && (              <Badge variant="outline" className={`uppercase text-xs leading-none ${
                variant === 'compact' ? 'px-1.5 py-0.5 h-5' : 'px-2 py-1 h-6'
              }`}>
                {product.sizes[0]}
              </Badge>
            )}

            {/* Badges de Cores - apenas se configurado para mostrar */}
            {showColors && product.show_colors_badge === true && product.colors && product.colors.length > 0 && (
              <>
                {product.colors.slice(0, 3).map((color, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-xs leading-none capitalize ${
                      variant === 'compact' ? 'px-1.5 py-0.5 h-5' : 'px-2 py-1 h-6'
                    }`}
                  >
                    {color}
                  </Badge>
                ))}
                {product.colors.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs leading-none ${
                      variant === 'compact' ? 'px-1.5 py-0.5 h-5' : 'px-2 py-1 h-6'
                    }`}
                  >
                    +{product.colors.length - 3}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Nome do produto */}
          <h3 className={`font-semibold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 ${
            variant === 'compact' ? 'text-sm sm:text-base' : 'text-lg'
          }`}>
            {product.name}
          </h3>

          {/* Descrição */}
          {showDescription && (
            <p className={`text-muted-foreground line-clamp-2 leading-relaxed ${
              variant === 'compact' ? 'text-xs' : 'text-sm'
            }`}>
              {product.description}
            </p>
          )}

          {/* Rating (para variantes detailed e favorites) */}
          {showRating && (variant === 'detailed' || variant === 'favorites') && (
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          )}
        </Link>        {/* Preços */}
        <div className="space-y-2">
          <div>
            <span className={`font-bold text-black ${
              variant === 'compact' ? 'text-base sm:text-lg' : 'text-2xl'
            }`}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>          {showActions && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                  CartManager.addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: imageUrl
                  });
                  
                  console.log('✅ Produto adicionado ao carrinho:', product.name);
                } catch (error) {
                  console.error('❌ Erro ao adicionar ao carrinho:', error);
                }
              }}
              className={`w-full bg-black hover:bg-black/90 transition-colors duration-300 ${
                variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs px-3 py-2'
              }`}
              style={{ color: '#F5F0EB' }}
            >
              <ShoppingCart className="w-3 h-3 mr-1" style={{ color: '#F5F0EB' }} />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">+</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
