'use client';

import { useState, useEffect, useCallback } from 'react';

const LIKES_STORAGE_KEY = 'ruge-liked-products';

export function useLikes() {
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load likes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      if (stored) {
        const likedIds = JSON.parse(stored) as string[];
        setLikedProducts(new Set(likedIds));
      }
    } catch (error) {
      console.error('Error loading likes from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save likes to localStorage whenever they change
  const saveLikes = useCallback((likes: Set<string>) => {
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likes)));
    } catch (error) {
      console.error('Error saving likes to localStorage:', error);
    }
  }, []);

  // Toggle like status for a product
  const toggleLike = useCallback((productId: string) => {
    setLikedProducts(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(productId)) {
        newLikes.delete(productId);
      } else {
        newLikes.add(productId);
      }
      saveLikes(newLikes);
      return newLikes;
    });
  }, [saveLikes]);

  // Check if a product is liked
  const isLiked = useCallback((productId: string) => {
    return likedProducts.has(productId);
  }, [likedProducts]);

  // Get array of liked product IDs
  const getLikedProducts = useCallback(() => {
    return Array.from(likedProducts);
  }, [likedProducts]);

  // Get count of liked products
  const likedCount = likedProducts.size;

  return {
    toggleLike,
    isLiked,
    getLikedProducts,
    likedCount,
    isLoaded
  };
}
