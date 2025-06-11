import { useState, useEffect } from 'react';
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
  };

  // Carregar produtos de uma coleção específica
  const getCollectionProducts = async (slug: string): Promise<CollectionProduct[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_collection_products', { collection_slug: slug });

      if (error) {
        throw error;
      }

      return (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.image_url,
        type: product.type,
        style: product.style,
        colors: product.colors || [],
        isActive: product.is_active,
        isNewArrival: product.is_new_arrival,
        isOnSale: product.is_on_sale
      }));
    } catch (error) {
      console.error(`Erro ao carregar produtos da coleção ${slug}:`, error);
      return [];
    }
  };

  // Obter coleção por slug
  const getCollectionBySlug = (slug: string): Collection | undefined => {
    return collections.find(collection => collection.slug === slug);
  };

  // Verificar se um produto está em uma coleção
  const isProductInCollection = (productId: string, collectionSlug: string): boolean => {
    const collection = getCollectionBySlug(collectionSlug);
    return collection ? (collection.productIds || []).includes(productId) : false;
  };

  // Obter coleções que contêm um produto específico
  const getProductCollections = (productId: string): Collection[] => {
    return collections.filter(collection => 
      (collection.productIds || []).includes(productId)
    );
  };

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
