'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { isSupabaseStorageUrl } from '@/lib/imageUtils';

interface FastImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

/**
 * Componente de imagem otimizado que evita problemas de timeout
 * - Para URLs do Supabase: usa <img> direto (mais rápido)
 * - Para outras URLs: usa Next.js Image (com otimização)
 */
export function FastImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  priority = false,
}: FastImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Se for URL do Supabase, usar img direto para evitar timeout
  const useDirectImage = isSupabaseStorageUrl(src);
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      try {
        onLoad();
      } catch (error) {
        console.warn('Erro no callback onLoad:', error);
      }
    }
  };

  const handleError = (event?: Event | React.SyntheticEvent) => {
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      try {
        onError();
      } catch (error) {
        console.warn('Erro no callback onError:', error);
      }
    }
  };

  // Placeholder enquanto carrega
  if (isLoading && placeholder === 'blur') {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se deu erro, mostrar placeholder
  if (imageError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center border border-gray-200`}>
        <div className="text-center text-gray-500 p-4">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Imagem não disponível</div>
        </div>
      </div>
    );
  }

  // Para URLs do Supabase, usar img direto
  if (useDirectImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          objectFit: 'cover',
          transition: 'opacity 0.3s ease',
          opacity: isLoading ? 0 : 1,
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  // Para outras URLs, usar Next.js Image
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fill={fill}
      sizes={sizes}
      quality={quality}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      onLoad={handleLoad}
      onError={handleError}
      priority={priority}
    />
  );
}

// Componente específico para cards de produto
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  variant?: 'card' | 'carousel' | 'thumbnail' | 'zoom';
}

export function ProductImage({ 
  src, 
  alt, 
  className = '', 
  variant = 'card' 
}: ProductImageProps) {
  const dimensions = {
    card: { width: 400, height: 400 },
    carousel: { width: 800, height: 600 },
    thumbnail: { width: 150, height: 150 },
    zoom: { width: 1200, height: 900 },
  };

  const { width, height } = dimensions[variant];

  return (
    <FastImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      quality={variant === 'zoom' ? 95 : 85}
      placeholder="blur"
      sizes={
        variant === 'card' ? '400px' :
        variant === 'carousel' ? '800px' :
        variant === 'thumbnail' ? '150px' :
        '1200px'
      }
    />
  );
}
