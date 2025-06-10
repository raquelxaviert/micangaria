'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LIKES_STORAGE_KEY = 'ruge-liked-products';

interface LikesContextType {
  toggleLike: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  getLikedProducts: () => string[];
  likedCount: number;
  isLoaded: boolean;
  syncFavorites: () => Promise<void>;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

interface LikesProviderProps {
  children: ReactNode;
}

export function LikesProvider({ children }: LikesProviderProps) {
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, session } = useAuth();
  const supabase = createClient();

  // Load likes from localStorage and Supabase
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Always start with localStorage for immediate UI
        const stored = localStorage.getItem(LIKES_STORAGE_KEY);
        if (stored) {
          const likedIds = JSON.parse(stored) as string[];
          setLikedProducts(new Set(likedIds));
        }

        // If user is logged in, sync with Supabase
        if (user && session) {
          await syncWithSupabase();
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    // Add delay to ensure client-side hydration is complete
    const timer = setTimeout(loadFavorites, 100);
    return () => clearTimeout(timer);
  }, [user, session]);

  // Sync with Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!user || !session) return;

    try {
      // Get favorites from Supabase
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites from Supabase:', error);
        return;
      }

      if (favorites) {
        const supabaseLikes = new Set(favorites.map(fav => fav.product_id));
        
        // Get localStorage favorites
        const stored = localStorage.getItem(LIKES_STORAGE_KEY);
        const localLikes = stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();

        // Merge: localStorage + Supabase favorites
        const mergedLikes = new Set([...localLikes, ...supabaseLikes]);

        // Save any new favorites from localStorage to Supabase
        const newLocalFavorites = [...localLikes].filter(id => !supabaseLikes.has(id));
        if (newLocalFavorites.length > 0) {
          const { error: insertError } = await supabase
            .from('user_favorites')
            .insert(
              newLocalFavorites.map(productId => ({
                user_id: user.id,
                product_id: productId
              }))
            );

          if (insertError) {
            console.error('Error syncing local favorites to Supabase:', insertError);
          }
        }

        // Update state and localStorage
        setLikedProducts(mergedLikes);
        saveLikesToLocal(mergedLikes);
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    }
  }, [user, session, supabase]);

  // Save likes to localStorage
  const saveLikesToLocal = useCallback((likes: Set<string>) => {
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likes)));
    } catch (error) {
      console.error('Error saving likes to localStorage:', error);
    }
  }, []);

  // Save/remove favorite in Supabase
  const saveLikeToSupabase = useCallback(async (productId: string, isLiking: boolean) => {
    if (!user || !session) return;

    try {
      if (isLiking) {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error && error.code !== '23505') { // Ignore duplicate key error
          console.error('Error adding favorite to Supabase:', error);
        }
      } else {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          console.error('Error removing favorite from Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error updating favorite in Supabase:', error);
    }
  }, [user, session, supabase]);

  // Toggle like status for a product
  const toggleLike = useCallback((productId: string) => {
    setLikedProducts(prev => {
      const newLikes = new Set(prev);
      const isLiking = !newLikes.has(productId);
      
      if (isLiking) {
        newLikes.add(productId);
      } else {
        newLikes.delete(productId);
      }
      
      // Save to localStorage immediately
      saveLikesToLocal(newLikes);
      
      // Save to Supabase if user is logged in
      if (user && session) {
        saveLikeToSupabase(productId, isLiking);
      }
      
      return newLikes;
    });
  }, [saveLikesToLocal, saveLikeToSupabase, user, session]);

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

  // Sync favorites when user logs in
  const syncFavorites = useCallback(async () => {
    if (user && session) {
      await syncWithSupabase();
    }
  }, [syncWithSupabase, user, session]);

  const value: LikesContextType = {
    toggleLike,
    isLiked,
    getLikedProducts,
    likedCount,
    isLoaded,
    syncFavorites
  };

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes(): LikesContextType {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}