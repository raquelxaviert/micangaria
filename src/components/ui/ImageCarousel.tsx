'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';
import { SimpleFastImage } from '@/components/ui/SimpleFastImage';

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
  
  // Pan functionality states
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Se não há imagens ou array vazio, usar placeholder
  const imageList = images && images.length > 0 ? images : ['/products/placeholder.jpg'];

  // Otimizar URLs das imagens para diferentes tamanhos
  const optimizedImages = imageList.map(url => ({
    carousel: getOptimizedImageUrl(url, IMAGE_CONFIGS.gallery), // Para o carousel principal
    zoom: getOptimizedImageUrl(url, IMAGE_CONFIGS.zoom), // Para zoom
    thumbnail: getOptimizedImageUrl(url, IMAGE_CONFIGS.thumbnail), // Para thumbnails
    original: url
  }));

  // Reset pan position when image changes or zoom is toggled
  useEffect(() => {
    setPanPosition({ x: 0, y: 0 });
    setHasMoved(false);
  }, [currentIndex, isZoomed]);

  // Reset hasMoved when stop dragging
  useEffect(() => {
    if (!isDragging) {
      // Reset hasMoved after a short delay to allow click handler to work
      const timer = setTimeout(() => {
        setHasMoved(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  // Mouse event handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed || !showZoom) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const maxPan = 100;
    const boundedX = Math.max(-maxPan, Math.min(maxPan, newX));
    const boundedY = Math.max(-maxPan, Math.min(maxPan, newY));
    
    setPanPosition({ x: boundedX, y: boundedY });
    setHasMoved(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isZoomed || !showZoom) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isZoomed) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    const maxPan = 100;
    const boundedX = Math.max(-maxPan, Math.min(maxPan, newX));
    const boundedY = Math.max(-maxPan, Math.min(maxPan, newY));
    
    setPanPosition({ x: boundedX, y: boundedY });
    setHasMoved(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (hasMoved) return; // Don't toggle zoom if user was dragging
    
    if (showZoom) {
      toggleZoom();
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    if (isZoomed) {
      setPanPosition({ x: 0, y: 0 });
    }
  };

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
      if (event.key === 'ArrowLeft' && !isZoomed) {
        goToPrevious();
      } else if (event.key === 'ArrowRight' && !isZoomed) {
        goToNext();
      } else if (event.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
        setPanPosition({ x: 0, y: 0 });
      } else if (event.key === ' ' && showZoom) {
        event.preventDefault();
        toggleZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, showZoom]);

  // Global mouse up handler for pan
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDragging || !isZoomed) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        const maxPan = 100;
        const boundedX = Math.max(-maxPan, Math.min(maxPan, newX));
        const boundedY = Math.max(-maxPan, Math.min(maxPan, newY));
        
        setPanPosition({ x: boundedX, y: boundedY });
      };

      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isDragging, isZoomed, dragStart]);

  return (
    <div className={`relative ${className}`}>
      {/* Main Image Display */}
      <div className={`relative ${isZoomed ? '' : 'rounded-lg border border-gray-200 shadow-sm'} ${isZoomed ? 'overflow-visible' : 'overflow-hidden'} ${isZoomed ? 'bg-transparent' : 'bg-gray-50'}`}>
        <div 
          ref={imageContainerRef}
          className="relative aspect-square"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageClick}
          style={{
            cursor: showZoom 
              ? (isZoomed 
                  ? (isDragging ? 'grabbing' : 'grab')
                  : 'zoom-in'
                )
              : 'default',
            userSelect: 'none',
            touchAction: isZoomed ? 'none' : 'auto'
          }}
        >
          <div
            className={`w-full h-full transition-all duration-300 ${
              isZoomed ? 'scale-150 bg-transparent' : ''
            }`}
            style={isZoomed ? {
              transform: `scale(1.5) translate(${panPosition.x / 1.5}px, ${panPosition.y / 1.5}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            } : undefined}
          >
            <SimpleFastImage
              src={isZoomed ? optimizedImages[currentIndex]?.zoom : optimizedImages[currentIndex]?.carousel}
              alt={`${alt} - Imagem ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              config={isZoomed ? 'zoom' : 'gallery'}
            />
          </div>

          {/* Navigation Buttons - Only show if more than 1 image and not zoomed */}
          {optimizedImages.length > 1 && !isZoomed && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm border-0 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="h-4 w-4 text-black" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm border-0 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="h-4 w-4 text-black" />
              </Button>
            </>
          )}

          {/* Zoom Button */}
          {showZoom && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm border-0 shadow-lg"
              onClick={toggleZoom}
            >
              {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </Button>
          )}

          {/* Zoom hint */}
          {isZoomed && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              Arraste para mover
            </div>
          )}

          {/* Image Counter */}
          {optimizedImages.length > 1 && !isZoomed && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {optimizedImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
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
              >
                <SimpleFastImage
                  src={imageSet.thumbnail}
                  alt={`${alt} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  config="thumbnail"
                />
                
                {/* Overlay para imagem selecionada */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
