import { useEffect, useState } from 'react';
import { preloadImage } from '@/lib/imageUtils';

export function useImagePreload(src: string, shouldPreload: boolean = false) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!shouldPreload || !src || isPreloaded) return;

    preloadImage(src)
      .then(() => {
        setIsPreloaded(true);
        setHasError(false);
      })
      .catch(() => {
        setHasError(true);
        setIsPreloaded(false);
      });
  }, [src, shouldPreload, isPreloaded]);

  return { isPreloaded, hasError };
}
