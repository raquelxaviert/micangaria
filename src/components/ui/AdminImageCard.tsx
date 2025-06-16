'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Package, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeicConverter } from '@/lib/heicConverter';

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
  const [hasError, setHasError] = useState(false);  // Otimizar URL do Google Drive para thumbnail
  const optimizedSrc = useCallback((url: string) => {
    if (!url) return '/products/placeholder.jpg';
    
    // Se for Google Drive, usar thumbnail otimizado
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400-c`;
      }
    }
    
    return url;
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    
    // Log específico para arquivos .heic
    if (src.toLowerCase().includes('.heic')) {
      console.error('Arquivo .heic não suportado pelo navegador:', src);
    }
    
    onError?.();
  }, [onError, src]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
  }, []);  if (hasError) {
    return (<div className={cn(
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
          <div key={index} className="relative aspect-square group">
            <AdminImageCard
              src={url}
              alt={`Produto ${index + 1}`}
              className="border-2 border-muted hover:border-primary/50 transition-colors"
            />
            
            {/* Indicador de imagem principal */}
            {index === 0 && (
              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded shadow-sm">
                Principal
              </div>
            )}
            
            {/* Botão de remover */}
            <button
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm transition-colors opacity-0 group-hover:opacity-100"
              title="Remover imagem"
            >
              ×
            </button>
            
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminImageCard;
