'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOptimizedImageUrl, IMAGE_CONFIGS, loadImageWithFallback, getPlaceholderUrl } from '@/lib/imageUtils';

interface UltraFastImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: boolean;
  config?: 'thumbnail' | 'card' | 'gallery' | 'full' | 'zoom';
}

/**
 * Componente de imagem SIMPLIFICADO e OTIMIZADO
 * 
 * Características:
 * - Carregamento direto sem Intersection Observer complexo
 * - Fallback inteligente com timeout
 * - URLs otimizadas para Google Drive
 * - Placeholder durante carregamento
 * - Retry automático em caso de erro
 */
export function UltraFastImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes,
  quality = 75,
  priority = false,
  onLoad,
  onError,
  placeholder = true,
  config = 'card'
}: UltraFastImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Configuração de imagem baseada no contexto
  const imageConfig = IMAGE_CONFIGS[config];
  
  // Otimizar URL da imagem
  const optimizedSrc = getOptimizedImageUrl(src, imageConfig);
  
  // Placeholder otimizado
  const placeholderSrc = getPlaceholderUrl(
    width || imageConfig.width || 400,
    height || imageConfig.height || 400
  );

  // Função para carregar imagem com fallback
  const loadImage = useCallback(async () => {
    if (!src) {
      setCurrentSrc(placeholderSrc);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      // Timeout mais agressivo para melhor UX
      const timeout = priority ? 3000 : 5000;
      const finalSrc = await loadImageWithFallback(optimizedSrc, placeholderSrc, timeout);
      
      setCurrentSrc(finalSrc);
      setIsLoading(false);
      
      if (finalSrc === optimizedSrc) {
        onLoad?.();
      } else {
        // Se usou fallback, tentar novamente em background
        setTimeout(() => {
          if (retryCount < 2) {
            setRetryCount(prev => prev + 1);
            loadImage();
          }
        }, 1000);
      }
    } catch (error) {
      console.warn('Erro ao carregar imagem:', src, error);
      setCurrentSrc(placeholderSrc);
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  }, [src, optimizedSrc, placeholderSrc, priority, retryCount, onLoad, onError]);

  // Carregar imagem quando src mudar
  useEffect(() => {
    setRetryCount(0);
    loadImage();
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setCurrentSrc(placeholderSrc);
    onError?.();
  };

  const handleRetry = () => {
    setRetryCount(0);
    loadImage();
  };

  // Estilos dinâmicos
  const imageStyles = {
    width: fill ? '100%' : width,
    height: fill ? '100%' : height,
    objectFit: 'cover' as const,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0.6 : 1,
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        minHeight: fill ? '100%' : height,
      }}
    >
      {/* Placeholder durante carregamento */}
      {placeholder && isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Imagem principal */}
      <img
        src={currentSrc || placeholderSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-60' : 'opacity-100'}`}
        style={imageStyles}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
      />

      {/* Indicador de erro com retry */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center cursor-pointer"
          onClick={handleRetry}
          style={{ zIndex: 2 }}
        >
          <div className="text-center text-gray-500 p-4">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm mb-2">Erro ao carregar</div>
            <button 
              className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleRetry();
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Loading spinner para imagens prioritárias */}
      {priority && isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 3 }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
} 