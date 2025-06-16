'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Card } from '@/components/ui/card';

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

  // Pré-carregar imagens
  useEffect(() => {
    const preloadImage = (url: string) => {
      if (preloadedImages.has(url)) return;
      
      const img = new window.Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, url]));
      };
      img.src = url;
    };

    // Pré-carregar a imagem atual e a próxima
    const currentImage = imageList[currentIndex];
    const nextImage = imageList[(currentIndex + 1) % imageList.length];
    
    preloadImage(currentImage);
    preloadImage(nextImage);
  }, [currentIndex, imageList, preloadedImages]);

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
      <Card className="relative overflow-hidden bg-gray-50">
        <div className="relative aspect-square">
          <Image
            src={imageList[currentIndex]}
            alt={`${alt} - Imagem ${currentIndex + 1}`}
            fill
            className={`object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => showZoom && setIsZoomed(!isZoomed)}
            priority={currentIndex === 0}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Navigation Buttons - Only show if more than 1 image */}
          {imageList.length > 1 && (
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
          )}

          {/* Image Counter */}
          {imageList.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {imageList.length}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Navigation */}
      {showThumbnails && imageList.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {imageList.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-primary shadow-md scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:scale-105'
              }`}
            >
              <Image
                src={image}
                alt={`${alt} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                quality={75}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots Indicator (alternative to thumbnails) */}
      {!showThumbnails && imageList.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {imageList.map((_, index) => (
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
