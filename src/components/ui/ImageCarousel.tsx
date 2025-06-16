'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getOptimizedGoogleDriveUrl, IMAGE_CONFIGS, preloadImages } from '@/lib/imageUtils';

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);

  // Configuração do swipe - distância mínima para considerar um swipe
  const minSwipeDistance = 50;

  // Se não há imagens ou array vazio, usar placeholder
  const imageList = images && images.length > 0 ? images : ['/products/placeholder.jpg'];

  // Otimizar URLs das imagens para diferentes tamanhos
  const optimizedImages = imageList.map(url => ({
    carousel: getOptimizedGoogleDriveUrl(url, IMAGE_CONFIGS.carousel),
    zoom: getOptimizedGoogleDriveUrl(url, IMAGE_CONFIGS.zoom),
    thumbnail: getOptimizedGoogleDriveUrl(url, IMAGE_CONFIGS.thumbnail),
    original: url
  }));

  // Pré-carregar imagens adjacentes para navegação mais suave
  useEffect(() => {
    const preloadAdjacent = async () => {
      const toPreload: string[] = [];
      
      // Pré-carregar próxima e anterior
      if (optimizedImages.length > 1) {
        const nextIndex = currentIndex === optimizedImages.length - 1 ? 0 : currentIndex + 1;
        const prevIndex = currentIndex === 0 ? optimizedImages.length - 1 : currentIndex - 1;
        
        toPreload.push(
          optimizedImages[nextIndex].carousel,
          optimizedImages[prevIndex].carousel
        );
      }
      
      if (toPreload.length > 0) {
        await preloadImages(toPreload);
      }
    };

    preloadAdjacent();
  }, [currentIndex, optimizedImages]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
    );
  };
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
  };

  // Funções para swipe touch
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && imageList.length > 1) {
      goToNext();
    }
    if (isRightSwipe && imageList.length > 1) {
      goToPrevious();
    }
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
    <div className={`relative ${className}`}>      {/* Main Image Display */}
      <Card className="relative overflow-hidden bg-gray-50">
        <div 
          ref={imageRef}
          className="relative aspect-square"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}        >
          <Image
            src={isZoomed ? optimizedImages[currentIndex].zoom : optimizedImages[currentIndex].carousel}
            alt={`${alt} - Imagem ${currentIndex + 1}`}
            fill
            className={`object-cover transition-all duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => showZoom && setIsZoomed(!isZoomed)}
            priority={currentIndex === 0}
            draggable={false}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            sizes={isZoomed ? '1200px' : '800px'}
            quality={90}
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}          {/* Navigation Buttons - Only show if more than 1 image */}
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
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 px-1">
          {optimizedImages.map((imageSet, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative aspect-square w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                index === currentIndex 
                  ? 'ring-2 ring-primary ring-offset-2 shadow-lg transform scale-105' 
                  : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:scale-105 opacity-70 hover:opacity-90'
              }`}
            >
              <Image
                src={imageSet.thumbnail}
                alt={`${alt} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                quality={75}
              />
              {/* Overlay para imagem selecionada */}
              {index === currentIndex && (
                <div className="absolute inset-0 bg-primary/10 border border-primary/20" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Dots Indicator (alternative to thumbnails) */}
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
