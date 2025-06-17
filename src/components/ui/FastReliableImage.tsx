'use client';

import { useState, useRef, useEffect } from 'react';

// Componente de imagem ULTRA OTIMIZADO - nunca trava, sempre carrega algo
export const ReliableImage = ({ src, alt, className, priority = false }: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actualSrc, setActualSrc] = useState(src);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Auto-timeout para evitar loading infinito (nunca mais que 5 segundos)
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
      }
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading]);

  // Reset quando src muda
  useEffect(() => {
    setLoading(true);
    setError(false);
    setActualSrc(src);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Fallback inteligente
    if (actualSrc !== '/products/placeholder.jpg') {
      setActualSrc('/products/placeholder.jpg');
      setLoading(true);
      setError(false);
    }
  };

  // Fallback visual quando há erro
  if (error && actualSrc === '/products/placeholder.jpg') {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
        <div className="text-center text-gray-500 p-4">
          <div className="text-2xl mb-1">�️</div>
          <div className="text-xs font-medium">Imagem indisponível</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-gray-50 relative overflow-hidden`}>
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={actualSrc}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-200"
        style={{ 
          opacity: loading ? 0 : 1,
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
};
