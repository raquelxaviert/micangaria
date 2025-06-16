'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Package, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface AdminImageCardProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: boolean;
}

/**
 * Componente otimizado para exibição de imagens no painel admin
 * Características:
 * - Lazy loading automático
 * - Placeholder com loading skeleton
 * - Fallback para imagens não encontradas
 * - Otimização para thumbnails do Google Drive
 * - Feedback visual de carregamento
 * - Responsividade
 */
export function AdminImageCard({ 
  src, 
  alt, 
  className, 
  priority = false,
  onLoad,
  onError,
  placeholder = true
}: AdminImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Otimizar URL do Google Drive para thumbnail RÁPIDO
  const optimizedSrc = useCallback((url: string) => {
    if (!url) return '/products/placeholder.jpg';
    
    // Usar função utilitária para otimizar URLs do Google Drive
    const optimized = getOptimizedImageUrl(url, IMAGE_CONFIGS.card);
    console.log('🚀 URL otimizada:', url, '→', optimized);
    return optimized;
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    console.error('❌ Erro ao carregar imagem:', src);
    onError?.();
  }, [onError, src]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
  }, []);

  if (hasError) {
    return (
      <div className={cn(
        "w-full h-full bg-muted/50 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25",
        className
      )}>
        <Package className="w-8 h-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground text-center px-2">
          Imagem não encontrada
        </p>
        <button
          onClick={handleRetry}
          className="text-xs text-primary hover:text-primary/80 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Loading skeleton */}
      {isLoading && placeholder && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse rounded-lg flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      )}

      <Image
        src={optimizedSrc(src)}
        alt={alt}
        fill
        className={cn(
          "object-cover rounded-lg transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvCc5OHv4HabBHcWAuEMypJ8AROg7TgGmHMmKVnKcUZMnHpRcZm2eWZ6Ci1Uny/8pEV1FcrCSTLkh/bZdHN2zITKN8iO7EJJ5WZBaHWMHNQJTDx7CWy1B1LkPKr6nTnK8TBIqjsXFlBGLfV5+wZF/9k="
      />
    </div>
  );
}

/**
 * Componente para preview de múltiplas imagens no formulário
 */
interface AdminImagePreviewProps {
  images: string[];
  onRemove: (index: number) => void;
  maxImages?: number;
  className?: string;
}

export function AdminImagePreview({ 
  images, 
  onRemove, 
  maxImages = 5,
  className 
}: AdminImagePreviewProps) {
  console.log('🖼️ AdminImagePreview renderizado com', images?.length || 0, 'imagens');
  
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Imagens Selecionadas ({images.length}/{maxImages})
        </span>
        {images.length >= maxImages && (
          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            Máximo atingido
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square group bg-muted rounded-lg overflow-hidden">
            <AdminImageCard
              src={url}
              alt={`Produto ${index + 1}`}
              className="border-2 border-muted hover:border-primary/50 transition-colors w-full h-full"
            />
            
            {/* Indicador de imagem principal */}
            {index === 0 && (
              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded shadow-sm z-10">
                Principal
              </div>
            )}

            {/* Botão de remover - sempre visível e clicável */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🗑️ Clicou para remover imagem índice:', index);
                onRemove(index);
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 z-20 cursor-pointer border-2 border-white hover:scale-110"
              title="Remover imagem"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminImageCard;
