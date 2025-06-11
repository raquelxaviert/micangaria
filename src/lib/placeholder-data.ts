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
  sale_end_date?: string;  search_keywords?: string[];
  vendor?: string;
  collection?: string;  notes?: string;
  care_instructions?: string;
  gallery_urls?: string[];
  
  // Badge display configuration
  show_colors_badge?: boolean;
  show_materials_badge?: boolean;
  show_sizes_badge?: boolean;
}

// ======================================================
// DADOS MOCKADOS - REMOVIDOS PARA TESTE LIMPO
// ======================================================
// Os produtos mock foram removidos para permitir teste
// da funcionalidade de criação de produtos do zero.
// Descomente e restaure os dados se necessário.

export const products: Product[] = [  {
    id: '1',
    name: 'Anel Vintage Solitário',
    description: 'Anel vintage em prata 925 com design clássico solitário. Peça atemporal que adiciona elegância a qualquer look.',
    price: 85.90,
    imageUrl: '/products/anel.jpg',
    imageHint: 'Anel vintage solitário em prata',
    type: 'anel',
    style: 'vintage',
    colors: ['prata', 'dourado'],
    isNewArrival: true,
    isPromotion: false,
  },  {
    id: '2', 
    name: 'Bolsa de Couro Vintage',
    description: 'Bolsa estruturada em couro legítimo, design clássico dos anos 60. Alça removível e compartimentos organizados.',
    price: 195.00,
    imageUrl: '/products/bolsa.jpg',
    imageHint: 'Bolsa de couro vintage',
    type: 'bolsa',
    style: 'vintage',
    colors: ['marrom', 'preto', 'cognac'],
    isNewArrival: false,
    isPromotion: true,
    promotionDetails: '20% OFF - Peça Única!',
  },  {
    id: '3',
    name: 'Brincos Argola Vintage',
    description: 'Brincos argola em metal dourado com acabamento vintage. Clássicos e versáteis para uso diário ou ocasiões especiais.',
    price: 65.50,
    imageUrl: '/products/brinco.jpg', 
    imageHint: 'Brincos argola vintage',
    type: 'brinco',
    style: 'retro',
    colors: ['dourado', 'prateado', 'rose gold'],
    isNewArrival: false,
    isPromotion: false,
  },  {
    id: '4',
    name: 'Cinto de Couro Vintage',
    description: 'Cinto em couro legítimo com fivela metálica vintage. Acessório essencial para marcar a cintura com estilo retrô.',
    price: 75.00,
    imageUrl: '/products/cinto.jpg',
    imageHint: 'Cinto de couro vintage',
    type: 'cinto',
    style: 'vintage',
    colors: ['marrom', 'preto', 'caramelo'],
    isNewArrival: true,
    isPromotion: false,
  },  {
    id: '5',
    name: 'Colar Corrente Dourado',
    description: 'Colar em corrente dourada com elos delicados, comprimento médio. Peça versátil que complementa qualquer produção.',
    price: 95.90,
    imageUrl: '/products/colar.jpg',
    imageHint: 'Colar corrente dourado',
    type: 'colar',
    style: 'vintage',
    colors: ['dourado', 'prateado', 'rose gold'],
    isNewArrival: false,
    isPromotion: false,
  },  {
    id: '6',
    name: 'Colar Pérolas Vintage',
    description: 'Colar de pérolas cultivadas com fecho vintage em metal dourado. Elegância clássica para ocasiões especiais.',
    price: 155.00,
    imageUrl: '/products/colar2.jpg',
    imageHint: 'Colar de pérolas vintage',
    type: 'colar',
    style: 'vintage',
    colors: ['branco', 'creme', 'dourado'],
    isNewArrival: false,
    isPromotion: true,
    promotionDetails: 'Frete Grátis!',
  },
  {
    id: '7',
    name: 'Colar Choker Vintage',
    description: 'Choker em veludo com pingente metálico, estilo gótico romântico dos anos 90. Acessório statement único.',
    price: 55.90,
    imageUrl: '/products/colar3.jpg',
    imageHint: 'Choker vintage anos 90',
    type: 'colar',
    style: 'anos-90',
    colors: ['preto', 'bordeaux', 'azul marinho'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '8',
    name: 'Colar Medalha Vintage',
    description: 'Colar com medalha gravada em metal envelhecido, inspirado nos amuletos dos anos 70. Peça com personalidade.',
    price: 89.90,
    imageUrl: '/products/colar4.jpg',
    imageHint: 'Colar medalha vintage',
    type: 'colar',
    style: 'retro',
    colors: ['dourado envelhecido', 'prata antiga', 'bronze'],
    isNewArrival: true,
    isPromotion: false,
  },
  {
    id: '9',
    name: 'Colar Longo Boho',
    description: 'Colar longo com pedras naturais e detalhes em metal, estilo boho-chic. Perfeito para sobreposições.',
    price: 115.00,
    imageUrl: '/products/colar5.jpg',
    imageHint: 'Colar longo boho',
    type: 'colar',
    style: 'boho-vintage',
    colors: ['turquesa', 'âmbar', 'coral'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '10',
    name: 'Conjunto de Anéis Vintage',
    description: 'Conjunto com 3 anéis vintage em metais diferentes. Mix de texturas e estilos para usar empilhados ou separados.',
    price: 125.00,
    imageUrl: '/products/conjunto_aneis.jpg',
    imageHint: 'Conjunto de anéis vintage',
    type: 'conjunto',
    style: 'boho-vintage',
    colors: ['dourado', 'prateado', 'bronze'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '11',
    name: 'Conjunto Colar e Brinco',
    description: 'Conjunto harmonioso com colar e brincos combinando, design vintage elegante. Perfeito para ocasiões especiais.',
    price: 185.00,
    imageUrl: '/products/conjunto_colar_e_brinco.jpg',
    imageHint: 'Conjunto colar e brinco vintage',
    type: 'conjunto',
    style: 'vintage',
    colors: ['dourado', 'prata', 'rose gold'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '12',
    name: 'Conjunto de Colares',
    description: 'Trio de colares em tamanhos diferentes para sobreposição, estilo boho-vintage. Crie looks únicos com camadas.',
    price: 145.50,
    imageUrl: '/products/conjunto_colares.jpg',
    imageHint: 'Conjunto de colares boho',
    type: 'conjunto',
    style: 'boho-vintage',
    colors: ['dourado', 'bronze', 'cobre'],
    isNewArrival: false,
    isPromotion: true,
    promotionDetails: '15% OFF - Coleção Boho!',
  },
  {
    id: '13',
    name: 'Conjunto Pulseiras Vintage',
    description: 'Set de pulseiras vintage em metal e couro, inspiração rock anos 80. Estilo rebelde e autêntico.',
    price: 95.00,
    imageUrl: '/products/conjunto_pulseiras.jpg',
    imageHint: 'Conjunto pulseiras anos 80',
    type: 'conjunto',
    style: 'anos-80',
    colors: ['preto', 'marrom', 'prata'],
    isNewArrival: true,
    isPromotion: false,
  },
  {
    id: '14',
    name: 'Conjunto Pulseiras Douradas',
    description: 'Conjunto de pulseiras delicadas em metal dourado, diferentes texturas. Elegância sutil para o dia a dia.',
    price: 85.90,
    imageUrl: '/products/conjunto_pulseiras2.jpg',
    imageHint: 'Conjunto pulseiras douradas',
    type: 'conjunto',
    style: 'retro',
    colors: ['dourado', 'rose gold', 'champagne'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '15',
    name: 'Conjunto Pulseiras Boho',
    description: 'Mix de pulseiras estilo boho com cordões, metais e pedras naturais. Espírito livre e aventureiro.',
    price: 75.00,
    imageUrl: '/products/conjunto_pulseiras3.jpg',
    imageHint: 'Conjunto pulseiras boho',
    type: 'conjunto',
    style: 'boho-vintage',
    colors: ['natural', 'turquesa', 'coral'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '16',
    name: 'Conjunto Pulseiras Étnicas',
    description: 'Pulseiras com padrões étnicos e detalhes artesanais, inspiração vintage global. Peças com história e significado.',
    price: 105.00,
    imageUrl: '/products/conjunto_pulseiras4.jpg',
    imageHint: 'Conjunto pulseiras étnicas',
    type: 'conjunto',
    style: 'vintage',
    colors: ['bronze', 'prata antiga', 'dourado'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '17',
    name: 'Pulseira Vintage Clássica',
    description: 'Pulseira clássica em metal com elos vintage, fechamento seguro. Elegância atemporal para qualquer ocasião.',
    price: 65.00,
    imageUrl: '/products/pulseira.jpg',
    imageHint: 'Pulseira vintage clássica',
    type: 'pulseira',
    style: 'vintage',
    colors: ['dourado', 'prateado', 'bronze'],
    isNewArrival: false,
    isPromotion: false,
  },
  {
    id: '18',
    name: 'Sandália Vintage de Couro',
    description: 'Sandália em couro natural com detalhes vintage, salto baixo. Conforto e estilo retrô para o verão.',
    price: 135.00,
    imageUrl: '/products/sandalia.jpg',
    imageHint: 'Sandália vintage de couro',
    type: 'sandalia',
    style: 'retro',
    colors: ['caramelo', 'marrom', 'bege'],
    isNewArrival: false,
    isPromotion: false,
  },
];

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
