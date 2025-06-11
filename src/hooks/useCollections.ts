import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Collection {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  productIds?: string[];
  productCount?: number;
}

export interface CollectionProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: string;
  style: string;
  colors: string[];
  materials?: string[];
  sizes?: string[];
  isActive: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar coleções do Supabase
  const loadCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections_with_counts')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (collectionsError) {
        throw collectionsError;
      }

      if (collectionsData && collectionsData.length > 0) {
        // Carregar produtos das coleções
        const { data: collectionProducts, error: productsError } = await supabase
          .from('collection_products')
          .select('collection_id, product_id');

        if (productsError) {
          console.warn('Erro ao carregar produtos das coleções:', productsError);
        }

        const processedCollections = collectionsData.map(collection => ({
          id: collection.id,
          name: collection.name,
          description: collection.description || '',
          slug: collection.slug,
          color: collection.color,
          isActive: collection.is_active,
          displayOrder: collection.display_order,
          createdAt: new Date(collection.created_at),
          productCount: collection.product_count || 0,
          productIds: collectionProducts 
            ? collectionProducts
                .filter(cp => cp.collection_id === collection.id)
                .map(cp => cp.product_id)
            : []
        }));

        setCollections(processedCollections);
      } else {
        // Fallback para localStorage se não houver dados no Supabase
        const stored = localStorage.getItem('micangaria_collections');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCollections(parsed.map((c: any) => ({
              ...c,
              createdAt: new Date(c.createdAt)
            })));
          } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            setCollections([]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback para localStorage em caso de erro
      const stored = localStorage.getItem('micangaria_collections');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCollections(parsed.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })));
        } catch (fallbackError) {
          console.error('Erro no fallback localStorage:', fallbackError);
          setCollections([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };  // Carregar produtos de uma coleção específica
  const getCollectionProducts = useCallback(async (slug: string): Promise<CollectionProduct[]> => {
    try {
      // Busca direta dos produtos sem usar RPC
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`🔍 Produtos para coleção ${slug}:`, data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📝 Primeiro produto da coleção:', {
          id: data[0].id,
          name: data[0].name,
          materials: data[0].materials,
          sizes: data[0].sizes,
          materialsType: typeof data[0].materials,
          sizesType: typeof data[0].sizes
        });
      }

      return (data || []).map((product: any) => {
        // Garantir que materials e sizes sejam arrays
        let materials: string[] = [];
        let sizes: string[] = [];

        try {
          materials = Array.isArray(product.materials) 
            ? product.materials 
            : (product.materials ? JSON.parse(product.materials) : []);
        } catch (e) {
          console.warn('Erro ao processar materials:', e);
          materials = [];
        }

        try {
          sizes = Array.isArray(product.sizes) 
            ? product.sizes 
            : (product.sizes ? JSON.parse(product.sizes) : []);
        } catch (e) {
          console.warn('Erro ao processar sizes:', e);
          sizes = [];
        }        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.image_url,
          gallery_urls: product.gallery_urls || [],
          type: product.type,
          style: product.style,
          colors: product.colors || [],
          materials: materials,
          sizes: sizes,
          isActive: product.is_active,
          isNewArrival: product.is_new_arrival,
          isOnSale: product.is_on_sale
        };
      }).slice(0, 6); // Limitar a 6 produtos para as coleções
    } catch (error) {
      console.error(`Erro ao carregar produtos da coleção ${slug}:`, error);
      return [];
    }
  }, []);

  // Obter coleção por slug
  const getCollectionBySlug = useCallback((slug: string): Collection | undefined => {
    return collections.find(collection => collection.slug === slug);
  }, [collections]);

  // Verificar se um produto está em uma coleção
  const isProductInCollection = useCallback((productId: string, collectionSlug: string): boolean => {
    const collection = getCollectionBySlug(collectionSlug);
    return collection ? (collection.productIds || []).includes(productId) : false;
  }, [getCollectionBySlug]);

  // Obter coleções que contêm um produto específico
  const getProductCollections = useCallback((productId: string): Collection[] => {
    return collections.filter(collection => 
      (collection.productIds || []).includes(productId)
    );
  }, [collections]);

  useEffect(() => {
    loadCollections();
  }, []);

  return {
    collections,
    isLoading,
    error,
    loadCollections,
    getCollectionProducts,
    getCollectionBySlug,
    isProductInCollection,
    getProductCollections
  };
}

export default useCollections;
