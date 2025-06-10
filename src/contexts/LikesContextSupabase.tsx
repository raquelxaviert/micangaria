'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LIKES_STORAGE_KEY = 'ruge-liked-products';

// Mapping from old localStorage IDs to new Supabase UUIDs
const ID_MIGRATION_MAP: Record<string, string> = {
  '1': 'c31139ee-bd31-47af-98f2-7cf31820f8fd', // Product 1
  '2': '9bb69ac6-4e5b-4c08-b6b1-cddb876f3239', // Product 2
  '3': 'ff962239-f175-425b-84b1-46a6c55ba2b5', // Product 3
};

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
  const [isLoaded, setIsLoaded] = useState(false);  const { user, session } = useAuth();
  const supabase = createClient();

  // Migrate old localStorage IDs to new UUIDs
  const migrateLocalStorageIds = useCallback(() => {
    try {
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      if (!stored) return new Set<string>();

      const likedIds = JSON.parse(stored) as string[];
      const migratedIds = likedIds
        .map(id => ID_MIGRATION_MAP[id] || id) // Use mapped UUID or keep original ID
        .filter(Boolean); // Remove any undefined values

      // Save migrated IDs back to localStorage
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(migratedIds));
      
      console.log('localStorage migration:', {
        original: likedIds,
        migrated: migratedIds
      });

      return new Set(migratedIds);
    } catch (error) {
      console.error('Error migrating localStorage IDs:', error);
      return new Set<string>();
    }
  }, []);

  // Load likes from localStorage and Supabase
  useEffect(() => {    const loadFavorites = async () => {
      try {
        // First, migrate any old localStorage IDs to new UUIDs
        const migratedLikes = migrateLocalStorageIds();
        setLikedProducts(migratedLikes);

        // If user is logged in, sync with Supabase
        if (user && session) {
          await syncWithSupabase();
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoaded(true);
      }
    };    // Add delay to ensure client-side hydration is complete
    const timer = setTimeout(loadFavorites, 100);
    return () => clearTimeout(timer);
  }, [user, session, migrateLocalStorageIds]);

  // Sync with Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!user || !session) return;

    try {
      // Get favorites from Supabase
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_id', user.id);      if (error) {
        console.error('Error fetching favorites from Supabase:', error);
        console.error('Fetch error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      if (favorites) {
        const supabaseLikes = new Set(favorites.map(fav => fav.product_id));
          // Get localStorage favorites (already migrated)
        const stored = localStorage.getItem(LIKES_STORAGE_KEY);
        const localLikes = stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();

        console.log('Syncing favorites:', {
          supabase: Array.from(supabaseLikes),
          localStorage: Array.from(localLikes)
        });

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
            );          if (insertError) {
            console.error('Error syncing local favorites to Supabase:', insertError);
            console.error('Insert error details:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            });
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
          });        if (error && error.code !== '23505') { // Ignore duplicate key error
          console.error('Error adding favorite to Supabase:', error);
          console.error('Add error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            user_id: user.id,
            product_id: productId
          });
        }
      } else {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);        if (error) {
          console.error('Error removing favorite from Supabase:', error);
          console.error('Remove error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            user_id: user.id,
            product_id: productId
          });
        }
      }    } catch (error) {
      console.error('Error updating favorite in Supabase:', error);
      console.error('Catch error details:', JSON.stringify(error, null, 2));
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