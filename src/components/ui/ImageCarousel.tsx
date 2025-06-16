'use client';

import { useState, useEffect } from 'react';
import { FastImage } from '@/components/ui/FastImage';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
  showZoom?: boolean;
}

export function ImageCarousel({ 
  images, 
  alt, 
  className = "", 
  showThumbnails = true,
  showZoom = false 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  // Se não há imagens ou array vazio, usar placeholder
  const imageList = images && images.length > 0 ? images : ['/products/placeholder.jpg'];
  // Otimizar URLs das imagens para diferentes tamanhos
  const optimizedImages = imageList.map(url => ({
    carousel: getOptimizedImageUrl(url, IMAGE_CONFIGS.carousel),
    zoom: getOptimizedImageUrl(url, IMAGE_CONFIGS.zoom),
    thumbnail: getOptimizedImageUrl(url, IMAGE_CONFIGS.thumbnail),
    original: url
  }));
  // Pré-carregar imagens de forma mais eficiente
  useEffect(() => {
    const preloadImage = (url: string) => {
      if (preloadedImages.has(url)) return Promise.resolve();
      
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, url]));
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    };    const preloadAllImages = async () => {
      // Pré-carregar a imagem atual primeiro (prioridade máxima)
      const currentImage = optimizedImages[currentIndex]?.carousel;
      if (currentImage) await preloadImage(currentImage);

      // Pré-carregar próxima e anterior
      const nextImage = optimizedImages[(currentIndex + 1) % optimizedImages.length]?.carousel;
      const prevImage = optimizedImages[(currentIndex - 1 + optimizedImages.length) % optimizedImages.length]?.carousel;
      
      // Pré-carregar em paralelo
      const toPreload = [nextImage, prevImage].filter(Boolean);
      await Promise.all(toPreload.map(img => preloadImage(img!)));

      // Pré-carregar as restantes em background
      const remainingImages = optimizedImages.filter((_, index) => {
        return index !== currentIndex && 
               index !== (currentIndex + 1) % optimizedImages.length && 
               index !== (currentIndex - 1 + optimizedImages.length) % optimizedImages.length;
      });

      // Pré-carregar restantes com delay para não travar
      remainingImages.forEach((imageSet, i) => {
        setTimeout(() => {
          preloadImage(imageSet.carousel);
          if (showZoom) preloadImage(imageSet.zoom);
        }, i * 100);
      });
    };    preloadAllImages();
  }, [currentIndex, optimizedImages, showZoom]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? optimizedImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === optimizedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  return (
    <div className={`relative ${className}`}>
      {/* Main Image Display */}
      <Card className="relative overflow-hidden bg-gray-50">        <div className="relative aspect-square">
          <FastImage
            src={isZoomed ? optimizedImages[currentIndex]?.zoom : optimizedImages[currentIndex]?.carousel}
            alt={`${alt} - Imagem ${currentIndex + 1}`}
            fill
            className={`object-cover transition-all duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            priority={currentIndex === 0}
            quality={90}
          />
          
          {/* Click overlay para zoom */}
          {showZoom && (
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => setIsZoomed(!isZoomed)}
            />
          )}{/* Navigation Buttons - Only show if more than 1 image */}
          {optimizedImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm border-0 shadow-lg"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm border-0 shadow-lg"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Zoom Button */}
          {showZoom && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm border-0 shadow-lg"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          )}          {/* Image Counter */}
          {optimizedImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {optimizedImages.length}
            </div>
          )}
        </div>
      </Card>      {/* Thumbnail Navigation */}
      {showThumbnails && optimizedImages.length > 1 && (
        <div className="flex gap-3 mt-6 overflow-x-auto pb-4 px-3 pt-2">
          {optimizedImages.map((imageSet, index) => (
            <div key={index} className="flex-shrink-0 p-2">
              <button
                onClick={() => goToSlide(index)}
                className={`relative aspect-square w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                  index === currentIndex 
                    ? 'ring-2 ring-primary ring-offset-2 shadow-lg transform scale-105' 
                    : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:scale-105 opacity-70 hover:opacity-90'
                }`}
              >                <FastImage
                  src={imageSet.thumbnail}
                  alt={`${alt} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  quality={75}
                />
                {/* Overlay para imagem selecionada */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}{/* Dots Indicator (alternative to thumbnails) */}
      {!showThumbnails && optimizedImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {optimizedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
