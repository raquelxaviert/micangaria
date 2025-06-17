export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;  imageUrl: string;
  image_url?: string; // Supabase format
  galleryUrls?: string[];
  imageHint: string;
  type: 'acessorio' | 'bolsa' | 'colar' | 'brinco' | 'pulseira' | 'anel' | 'cinto' | 'sandalia' | 'conjunto';
  style: 'vintage' | 'retro' | 'boho-vintage' | 'anos-80' | 'anos-90' | 'boho' | 'indígena' | 'minimalista' | 'étnico';
  colors: string[];
  isNewArrival?: boolean;
  isPromotion?: boolean;
  promotionDetails?: string;
  
  // Extended fields for admin/Supabase integration
  compare_at_price?: number;
  cost_price?: number;
  materials?: string[];
  sizes?: string[];
  tags?: string[];
  weight_grams?: number;
  sku?: string;
  barcode?: string;
  track_inventory?: boolean;
  quantity?: number;
  allow_backorder?: boolean;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sale_start_date?: string;
  sale_end_date?: string;
  search_keywords?: string[];
  vendor?: string;
  collection?: string;
  notes?: string;
  care_instructions?: string;  gallery_urls?: string[];
  
  // Badge display configuration
  show_colors_badge?: boolean;
  show_materials_badge?: boolean;
  show_sizes_badge?: boolean;
  
  // Image optimization flag
  images_optimized?: boolean;
}

// ======================================================
// PRODUTOS - ARRAY VAZIO PARA TESTE LIMPO
// ======================================================
export const products: Product[] = [];

// Categorias iniciais (serão atualizadas dinamicamente)
export const categories = [
  { name: 'acessórios', label: 'Acessórios', count: 0 },
  { name: 'bolsas', label: 'Bolsas', count: 0 },
  { name: 'anéis', label: 'Anéis', count: 0 },
  { name: 'colares', label: 'Colares', count: 0 },
  { name: 'pulseiras', label: 'Pulseiras', count: 0 },
  { name: 'brincos', label: 'Brincos', count: 0 },
];

// Arrays dinâmicos (atualizados baseado nos produtos criados)
export const uniqueTypes: string[] = [];
export const uniqueStyles: string[] = [];
export const uniqueColors: string[] = [];
