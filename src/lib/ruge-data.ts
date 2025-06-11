export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  type: 'acessorio' | 'conjunto' | 'bolsa';
  style: 'vintage' | 'retro' | 'boho-vintage' | 'anos-80' | 'anos-90';
  colors: string[];
  isNewArrival?: boolean;
  isPromotion?: boolean;
  promotionDetails?: string;
}

// Array vazia - produtos virão do Supabase
export const products: Product[] = [];

// Constantes derivadas para filtragem - vazias por padrão
export const uniqueTypes: string[] = [];
export const uniqueStyles: string[] = [];
export const uniqueColors: string[] = [];
