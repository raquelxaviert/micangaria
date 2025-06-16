'use client';

import { useState } from 'react';
import Image from 'next/image';
import { isSupabaseStorageUrl } from '@/lib/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  priority?: boolean;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  sizes,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  priority = false,
  onError
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Se for URL do Supabase e houver erro, usar imagem não otimizada
  const shouldUseUnoptimized = isSupabaseStorageUrl(src) && imageError;

  const handleError = () => {
    console.warn('⚠️ Erro ao carregar imagem:', src);
    setImageError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Fallback para imagem não otimizada em caso de erro
  if (shouldUseUnoptimized) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    );
  }

  return (
    <>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={shouldUseUnoptimized}
      />
    </>
  );
}

// Versão para avatars/imagens pequenas
interface AvatarImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 40, 
  className = "" 
}: AvatarImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      sizes={`${size}px`}
      quality={90}
    />
  );
}

// Versão para cards de produto
interface ProductImageProps {
  src: string;
  alt: string;
  variant?: 'compact' | 'normal' | 'large';
  className?: string;
}

export function ProductImage({ 
  src, 
  alt, 
  variant = 'normal', 
  className = "" 
}: ProductImageProps) {
  const configs = {
    compact: { width: 240, height: 240, sizes: '240px' },
    normal: { width: 400, height: 400, sizes: '400px' },
    large: { width: 800, height: 800, sizes: '800px' }
  };
  
  const config = configs[variant];
  
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={config.width}
      height={config.height}
      className={`object-cover ${className}`}
      sizes={config.sizes}
      quality={85}
    />
  );
}
