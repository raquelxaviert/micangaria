export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
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
  care_instructions?: string;
  gallery_urls?: string[];
  
  // Badge display configuration
  show_colors_badge?: boolean;
  show_materials_badge?: boolean;
  show_sizes_badge?: boolean;
}

// ======================================================
// PRODUTOS - ARRAY VAZIO PARA TESTE LIMPO
// ======================================================
export const products: Product[] = [];

// Dados dos testemunhos (mantidos)
export const testimonials = [
  {
    id: '1',
    name: 'Ana Beatriz',
    age: 28,
    text: 'A consultoria da Maria Clara transformou meu guarda-roupa! Agora sei exatamente como usar minhas peças vintage para criar looks únicos.',
    avatar: '/testimonials/ana.jpg',
    rating: 5,
  },
  {
    id: '2',
    name: 'Juliana Santos',
    age: 35,
    text: 'As peças da RÜGE são incríveis! Cada uma conta uma história. Meu vestido anos 80 é sempre elogiado onde vou.',
    avatar: '/testimonials/juliana.jpg',
    rating: 5,
  },
  {
    id: '3',
    name: 'Carla Mendes',
    age: 42,
    text: 'Finalmente encontrei um brechó que entende de moda! A curadoria é impecável e o atendimento é personalizado.',
    avatar: '/testimonials/carla.jpg',
    rating: 5,
  },
  {
    id: '4',
    name: 'Fernanda Lima',
    age: 31,
    text: 'A RÜGE mudou minha relação com a moda. Agora valorizo peças com história e personalidade. Recomendo de olhos fechados!',
    avatar: '/testimonials/fernanda.jpg',
    rating: 5,
  },
];

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
