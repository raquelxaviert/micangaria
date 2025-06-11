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
  showLoginPrompt: boolean;
  setShowLoginPrompt: (show: boolean) => void;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

interface LikesProviderProps {
  children: ReactNode;
}

export function LikesProvider({ children }: LikesProviderProps) {
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user, session } = useAuth();
  const supabase = createClient();  // Function to validate and clean invalid IDs
  const validateAndCleanIds = useCallback((ids: string[]): string[] => {
    // Temporariamente desabilitando validação - todos os IDs são válidos
    return ids;
  }, []);// Fetch products from Supabase and create ID mapping
  const createIdMigrationMap = useCallback(async (): Promise<Record<string, string>> => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, category')
        .order('created_at', { ascending: true });      if (error) {
        console.log('Supabase não configurado ou indisponível (normal em desenvolvimento)');
        return {};
      }if (!products || products.length === 0) {
        console.log('No products found in Supabase for migration');
        return {};
      }

      // Create mapping: old ID (based on order) -> new UUID
      const migrationMap: Record<string, string> = {};
      products.forEach((product, index) => {
        const oldId = (index + 1).toString(); // '1', '2', '3', etc.
        migrationMap[oldId] = product.id;
      });

      console.log('Created dynamic ID migration map:', migrationMap);
      return migrationMap;    } catch (error) {
      console.log('Supabase indisponível (normal em desenvolvimento), continuando sem migração');
      return {};
    }
  }, [supabase]);
  // Migrate old localStorage IDs to new UUIDs
  const migrateLocalStorageIds = useCallback(async () => {
    try {
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      if (!stored) return new Set<string>();

      const likedIds = JSON.parse(stored) as string[];
      
      // Check if we need migration (if any ID is numeric)
      const needsMigration = likedIds.some(id => /^\d+$/.test(id));
      
      if (!needsMigration) {
        console.log('No migration needed, IDs are already UUIDs');
        return new Set(likedIds);
      }

      console.log('Migration needed for IDs:', likedIds);
      
      // Get dynamic mapping from Supabase
      const migrationMap = await createIdMigrationMap();
        if (Object.keys(migrationMap).length === 0) {
        console.warn('Could not create migration map, keeping original IDs for now');
        // Keep original IDs instead of clearing completely
        return new Set(likedIds);
      }

      const migratedIds = likedIds
        .map(id => migrationMap[id] || id) // Use mapped UUID or keep original ID
        .filter(Boolean); // Remove any undefined values

      // Save migrated IDs back to localStorage
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(migratedIds));
      
      console.log('localStorage migration completed:', {
        original: likedIds,
        migrated: migratedIds,
        map: migrationMap
      });

      return new Set(migratedIds);
    } catch (error) {
      console.error('Error migrating localStorage IDs:', error);
      // Return original IDs if migration fails
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();
    }
  }, [createIdMigrationMap]);  // Load likes from localStorage and Supabase
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Load from localStorage - não validar IDs aqui, deixar o componente fazer isso
        const stored = localStorage.getItem(LIKES_STORAGE_KEY);
        if (stored) {
          const storedIds = JSON.parse(stored) as string[];
          console.log('🔄 Carregando favoritos do localStorage:', storedIds);
          setLikedProducts(new Set(storedIds));
        } else {
          setLikedProducts(new Set<string>());
        }

        // If user is logged in, sync with Supabase
        if (user && session) {
          await syncWithSupabase();
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        // Fallback to empty set
        setLikedProducts(new Set<string>());
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
  }, [user, session, supabase]);  // Toggle like status for a product
  const toggleLike = useCallback((productId: string) => {
    setLikedProducts(prev => {
      const newLikes = new Set(prev);
      const isLiking = !newLikes.has(productId);
      
      if (isLiking) {
        newLikes.add(productId);
        
        // Mostrar popup de login apenas se o usuário não estiver logado e estiver curtindo
        if (!user && !session) {
          setShowLoginPrompt(true);
        }
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
  }, [likedProducts]);  // Get array of liked product IDs
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
    syncFavorites,
    showLoginPrompt,
    setShowLoginPrompt
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