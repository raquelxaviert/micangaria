'use client';

import Image from 'next/image';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface SimpleFastImageProps {
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
  config?: 'thumbnail' | 'card' | 'gallery' | 'full' | 'zoom';
}

/**
 * Componente de imagem SIMPLES e RÁPIDO
 * 
 * Características:
 * - Usa Next.js Image padrão (mais confiável)
 * - URLs otimizadas para Google Drive
 * - Fallback para placeholder
 * - Sem complexidade desnecessária
 */
export function SimpleFastImage({
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
  config = 'card'
}: SimpleFastImageProps) {
  // Configuração de imagem baseada no contexto
  const imageConfig = IMAGE_CONFIGS[config];
  
  // Otimizar URL da imagem
  const optimizedSrc = getOptimizedImageUrl(src, imageConfig);
  
  // Se não tem src, usar placeholder
  const finalSrc = optimizedSrc || '/products/placeholder.jpg';

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={fill ? undefined : (width || imageConfig.width || 400)}
      height={fill ? undefined : (height || imageConfig.height || 400)}
      className={className}
      fill={fill}
      sizes={sizes || '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
      quality={quality}
      priority={priority}
      onLoad={onLoad}
      onError={onError}
      style={{
        objectFit: 'cover',
      }}
    />
  );
} 