'use client';

import { useState, useEffect } from 'react';

// Componente de imagem confiável com fallback
export const ReliableImage = ({ src, alt, className, priority = false }: {
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
