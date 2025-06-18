'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, ShoppingCart, Star, Check, Clock, X } from 'lucide-react';
import { CartManager } from '@/lib/ecommerce';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';
import { useState, useEffect } from 'react';
import { useImagePreload } from '@/hooks/useImagePreload';
import { SimpleFastImage } from '@/components/ui/SimpleFastImage';
import { useProductStockStatus } from '@/hooks/useStockReservation';

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
  colors?: string[];
  materials?: string[]; // Materiais do produto
  sizes?: string[]; // Tamanhos disponíveis
  isNewArrival?: boolean;
  is_new_arrival?: boolean; // Supabase format
  isOnSale?: boolean;
  is_on_sale?: boolean; // Supabase format
  is_promotion?: boolean; // Supabase format
  promotionDetails?: string;
  promotion_details?: string; // Supabase format
  slug?: string; // URL slug
  // Badge display configuration
  show_colors_badge?: boolean;
  show_materials_badge?: boolean;
  show_sizes_badge?: boolean;
  // Stock reservation fields
  stock_available?: number;
  stock_reserved?: number;
  stock_available_updated?: number;
  stock_reserved_updated?: number;
}

interface ProductCardProps {
  product: ProductData;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showDescription?: boolean;
  showColors?: boolean;
  showRating?: boolean;
  className?: string;
  priority?: boolean; // Para priorizar o carregamento das primeiras imagens
}

export function ProductCard({ 
  product, 
  variant = 'default',
  showActions = true,
  showDescription = false,
  showColors = false,
  showRating = false,
  className = '',
  priority = false
}: ProductCardProps) {
  const [isInCart, setIsInCart] = useState(false);
  
  // Stock reservation hook para este produto específico
  const { 
    isReserved, 
    isSold,
    timeRemaining, 
    isLoading 
  } = useProductStockStatus(product.id);
  
  // Normalize product data to handle both formats
  const imageUrl = product.image_url || product.imageUrl || (product.gallery_urls && product.gallery_urls[0]) || '/products/placeholder.jpg';
  const isNewArrival = product.isNewArrival || product.is_new_arrival || false;
  const isOnSale = product.isOnSale || product.is_on_sale || product.is_promotion || false;
  const promotionDetails = product.promotion_details;
  
  // Get total number of images for indicator
  const totalImages = 1 + (Array.isArray(product.gallery_urls) ? product.gallery_urls.length : 0);
  
  // Verificar se o produto está no carrinho
  useEffect(() => {
    setIsInCart(CartManager.isInCart(product.id));
  }, [product.id]);
  
  // Listener para mudanças no carrinho
  useEffect(() => {
    const handleCartChange = () => {
      setIsInCart(CartManager.isInCart(product.id));
    };
    
    window.addEventListener('cartChanged', handleCartChange);
    return () => window.removeEventListener('cartChanged', handleCartChange);
  }, [product.id]);

  // Determinar o estado do produto
  const getProductStatus = () => {
    if (isSold) return 'sold';
    if (isReserved) return 'reserved';
    return 'available';
  };

  const productStatus = getProductStatus();

  // Renderizar botão baseado no status
  const renderActionButton = () => {
    if (!showActions) return null;

    switch (productStatus) {
      case 'sold':
        return (
          <Button 
            size="sm"
            disabled
            className={`w-full bg-gray-500 text-white cursor-not-allowed ${
              variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs px-3 py-2'
            }`}
          >
            <X className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Vendido</span>
            <span className="sm:hidden">Vendido</span>
          </Button>
        );

      case 'reserved':
        return (
          <Button 
            size="sm"
            disabled
            className={`w-full bg-orange-500 text-white cursor-not-allowed ${
              variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs px-3 py-2'
            }`}
          >
            <Clock className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Reservado ({timeRemaining})</span>
            <span className="sm:hidden">{timeRemaining}</span>
          </Button>
        );

      case 'available':
        return (
          <Button 
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              try {
                // Se já está no carrinho, remover
                if (CartManager.isInCart(product.id)) {
                  CartManager.removeItem(product.id);
                  setIsInCart(false);
                  return;
                }

                const success = CartManager.addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: imageUrl
                });
                
                if (success) {
                  console.log('✅ Produto adicionado ao carrinho:', product.name);
                  setIsInCart(true);
                }
              } catch (error) {
                console.error('❌ Erro ao adicionar ao carrinho:', error);
              }
            }}
            className={`w-full transition-colors duration-300 ${
              isInCart 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-black hover:bg-black/90'
            } ${
              variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs px-3 py-2'
            }`}
            style={isInCart ? {} : { color: '#F5F0EB' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                <span>Carregando...</span>
              </>
            ) : isInCart ? (
              <>
                <div className="flex items-center justify-center sm:hidden">
                  <ShoppingCart className="w-3 h-3" />
                  <Check className="w-3 h-3 ml-0.5" />
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <Check className="w-3 h-3 mr-1" />
                  <span>Ver no carrinho</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center sm:hidden">
                  <ShoppingCart className="w-3 h-3" />
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  <span>Adicionar</span>
                </div>
              </>
            )}
          </Button>
        );
    }
  };

  // Determinar configuração de imagem baseada no variant
  const getImageConfig = () => {
    switch (variant) {
      case 'compact':
        return 'thumbnail';
      case 'detailed':
        return 'gallery';
      default:
        return 'card';
    }
  };

  return (
    <Link href={`/products/${product.slug || product.id}`} className="block">
      <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}>
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            {/* SIMPLE FAST IMAGE - Versão simplificada e confiável */}
            <SimpleFastImage
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
              config={getImageConfig()}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            
            {/* Image Counter Badge */}
            {totalImages > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {totalImages} fotos
              </div>
            )}

            {/* Status Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNewArrival && (
                <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                  Novo
                </Badge>
              )}
              {isOnSale && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                  {promotionDetails || 'Oferta'}
                </Badge>
              )}
            </div>

            {/* Stock Status Overlay */}
            {productStatus !== 'available' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-lg font-semibold">
                    {productStatus === 'sold' ? 'Vendido' : 'Reservado'}
                  </div>
                  {productStatus === 'reserved' && (
                    <div className="text-sm">{timeRemaining}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            {/* Title and Price */}
            <div className="space-y-1">
              <h3 className={`font-medium text-gray-900 line-clamp-2 ${
                variant === 'compact' ? 'text-sm' : 'text-base'
              }`}>
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-gray-900 ${
                    variant === 'compact' ? 'text-sm' : 'text-lg'
                  }`}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                {showRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.8</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {showDescription && product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Colors Badge */}
            {showColors && product.colors && product.colors.length > 0 && product.show_colors_badge && (
              <div className="flex flex-wrap gap-1">
                {product.colors.slice(0, 3).map((color, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {color}
                  </Badge>
                ))}
                {product.colors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.colors.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Materials Badge */}
            {product.materials && product.materials.length > 0 && product.show_materials_badge && (
              <div className="flex flex-wrap gap-1">
                {product.materials.slice(0, 2).map((material, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {material}
                  </Badge>
                ))}
              </div>
            )}

            {/* Sizes Badge */}
            {product.sizes && product.sizes.length > 0 && product.show_sizes_badge && (
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((size, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    {size}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Button */}
            {renderActionButton()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
