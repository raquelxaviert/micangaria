'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, ShoppingCart, Star, Check } from 'lucide-react';
import { CartManager } from '@/lib/ecommerce';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';
import { useState, useEffect } from 'react';
import { useImagePreload } from '@/hooks/useImagePreload';

// Componente de imagem confiável com fallback
const ReliableImage = ({ src, alt, className, priority = false }: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Reset quando src muda
  useEffect(() => {
    setImageSrc(src);
    setImageError(false);
    setLoading(true);
    setRetryCount(0);
  }, [src]);

  // Fallback para imagem original se a otimizada falhar
  const handleError = () => {
    if (retryCount < 2) {
      // Tentar novamente após um delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setLoading(true);
        setImageError(false);
      }, 1000 * (retryCount + 1)); // Delay progressivo
    } else {
      // Após tentativas, mostrar erro
      setImageError(true);
      setLoading(false);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setImageError(false);
  };

  if (imageError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center text-gray-400 p-4">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-xs">Imagem indisponível</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-gray-50 relative overflow-hidden`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <img
        key={`${imageSrc}-${retryCount}`} // Force remount on retry
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: loading ? 0 : 1 }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};
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
  is_promotion?: boolean; // Supabase format  promotionDetails?: string;
  promotion_details?: string; // Supabase format
  slug?: string; // URL slug
  // Badge display configuration
  show_colors_badge?: boolean;
  show_materials_badge?: boolean;
  show_sizes_badge?: boolean;
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
  
  // Normalize product data to handle both formats
  const imageUrl = product.image_url || product.imageUrl || (product.gallery_urls && product.gallery_urls[0]) || '/products/placeholder.jpg';
  const isNewArrival = product.isNewArrival || product.is_new_arrival || false;
  const isOnSale = product.isOnSale || product.is_on_sale || product.is_promotion || false;
  const promotionDetails = product.promotion_details;
  // Get total number of images for indicator
  const totalImages = 1 + (Array.isArray(product.gallery_urls) ? product.gallery_urls.length : 0);
  // Otimizar URL da imagem para o tamanho do card
  const optimizedImageUrl = getOptimizedImageUrl(imageUrl, IMAGE_CONFIGS.card);
    // Verificar se o produto está no carrinho
  useEffect(() => {
    setIsInCart(CartManager.isInCart(product.id));
  }, [product.id]);
  // Preload da imagem se for prioritária
  const { isPreloaded } = useImagePreload(optimizedImageUrl, priority);
  // Listener para mudanças no carrinho
  useEffect(() => {
    const handleCartChange = () => {
      setIsInCart(CartManager.isInCart(product.id));
    };
    
    window.addEventListener('cartChanged', handleCartChange);
    return () => window.removeEventListener('cartChanged', handleCartChange);
  }, [product.id]);

  return (
    <Card className={`group hover:shadow-xl transition-all duration-500 overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 w-full ${className}`}>      <div className="relative">
        <Link href={`/products/${product.slug || product.id}`} className="block cursor-pointer">          <div className="relative overflow-hidden">            <div className={`product-card-image-container ${variant === 'compact' ? 'compact' : ''}`}>
              <ReliableImage
                src={optimizedImageUrl}
                alt={product.name}
                className="product-card-image group-hover:scale-110 transition-transform duration-700 w-full h-full"
                priority={priority}
              />
            </div>
            
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
            {variant === 'detailed' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
          </div>        </Link>
      </div>

      <CardContent className={`space-y-2 sm:space-y-4 ${variant === 'compact' ? 'p-2 sm:p-3' : 'p-5'}`}>        <Link href={`/products/${product.slug || product.id}`} className="block cursor-pointer">          {/* Todos os badges inline em uma única linha */}
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
          )}          {/* Rating (para variante detailed) */}
          {showRating && variant === 'detailed' && (
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
              }}              className={`w-full transition-colors duration-300 ${
                isInCart 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-black hover:bg-black/90'
              } ${
                variant === 'compact' ? 'text-xs px-2 py-1 h-8' : 'text-xs px-3 py-2'
              }`}
              style={isInCart ? {} : { color: '#F5F0EB' }}
            >              {isInCart ? (
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
                  <ShoppingCart className="w-3 h-3 mr-1" style={{ color: '#F5F0EB' }} />
                  <span className="hidden sm:inline">Adicionar</span>
                  <span className="sm:hidden">+</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
