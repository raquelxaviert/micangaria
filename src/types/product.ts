export type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  category_id: string | null;
  type: string | null;
  style: string | null;
  image_url: string | null;
  image_alt: string | null;
  gallery_urls: string[] | null;
  colors: string[] | null;
  materials: string[] | null;
  sizes: string[] | null;
  weight_grams: number | null;
  sku: string | null;
  barcode: string | null;
  track_inventory: boolean;
  quantity: number;
  allow_backorder: boolean;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  sale_start_date: string | null;
  sale_end_date: string | null;
  promotion_text: string | null;
  tags: string[] | null;
  search_keywords: string | null;
  vendor: string | null;
  collection: string | null;
  notes: string | null;
  image_storage_path: string | null;
  gallery_storage_paths: string[] | null;  care_instructions: string | null;
  show_colors_badge: boolean;
  show_materials_badge: boolean;
  show_sizes_badge: boolean;  show_materials_section: boolean;
  show_care_section: boolean;
  images_optimized: boolean;
};