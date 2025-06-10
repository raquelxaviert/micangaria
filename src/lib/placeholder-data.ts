export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  type: 'vestido' | 'blusa' | 'calca' | 'saia' | 'casaco' | 'acessorio' | 'conjunto' | 'bolsa';
  style: 'vintage' | 'retro' | 'boho-vintage' | 'anos-80' | 'anos-90';
  colors: string[];
  isNewArrival?: boolean;
  isPromotion?: boolean;
  promotionDetails?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Vestido Midi Estampado Anos 80',
    description: 'Vestido midi com estampa geométrica autêntica dos anos 80. Manga bufante e cintura marcada, perfeito para looks statement.',
    price: 185.90,
    imageUrl: '/products/vestido-80s.jpg',
    imageHint: '80s geometric print midi dress with puffy sleeves',
    type: 'vestido',
    style: 'anos-80',
    colors: ['azul', 'rosa', 'branco'],
    isNewArrival: true,
  },
  {
    id: '2',
    name: 'Blazer Estruturado Vintage',
    description: 'Blazer estruturado com ombreiras sutis, tecido de alta qualidade. Uma peça atemporal que eleva qualquer produção.',
    price: 225.00,
    imageUrl: '/products/blazer-vintage.jpg',
    imageHint: 'structured vintage blazer with shoulder pads',
    type: 'casaco',
    style: 'vintage',
    colors: ['preto', 'cinza', 'bege'],
    isPromotion: true,
    promotionDetails: '20% OFF - Peça Única!',
  },
  {
    id: '3',
    name: 'Blusa de Seda Retro',
    description: 'Blusa de seda pura com gola laço, inspirada no romantismo dos anos 70. Caimento fluido e elegante.',
    price: 145.50,
    imageUrl: '/products/blusa-seda.jpg',
    imageHint: 'silk blouse with bow collar 70s style',
    type: 'blusa',
    style: 'retro',
    colors: ['creme', 'bordô', 'verde'],
  },
  {
    id: '4',
    name: 'Calça Wide Leg Anos 90',
    description: 'Calça pantalona de cintura alta, tendência absoluta dos anos 90. Alonga a silhueta e é super confortável.',
    price: 165.00,
    imageUrl: '/products/calca-wide.jpg',
    imageHint: '90s high waist wide leg pants',
    type: 'calca',
    style: 'anos-90',
    colors: ['preto', 'marrom', 'azul marinho'],
    isNewArrival: true,
  },
  {
    id: '5',
    name: 'Saia Plissada Midi',
    description: 'Saia midi plissada em tecido fluido, um clássico atemporal. Versátil para looks casuais e formais.',
    price: 125.90,
    imageUrl: '/products/saia-plissada.jpg',
    imageHint: 'pleated midi skirt timeless vintage',
    type: 'saia',
    style: 'vintage',
    colors: ['camel', 'preto', 'verde oliva'],
  },
  {
    id: '6',
    name: 'Bolsa Estruturada Vintage',
    description: 'Bolsa estruturada em couro legítimo, design clássico dos anos 60. Alça removível e compartimentos organizados.',
    price: 195.00,
    imageUrl: '/products/bolsa-estruturada.jpg',
    imageHint: '60s structured leather handbag vintage',
    type: 'bolsa',
    style: 'vintage',
    colors: ['marrom', 'preto', 'cognac'],
    isPromotion: true,
    promotionDetails: 'Frete Grátis!',
  },
  {
    id: '7',
    name: 'Conjunto Moletom Retro',
    description: 'Conjunto de moletom oversized com estética dos anos 80. Conforto e estilo para o dia a dia urbano.',
    price: 189.90,
    imageUrl: '/products/conjunto-moletom.jpg',
    imageHint: '80s oversized sweatsuit set retro',
    type: 'conjunto',
    style: 'anos-80',
    colors: ['cinza', 'rosa', 'lilás'],
  },
  {
    id: '8',
    name: 'Óculos de Sol Vintage',
    description: 'Óculos com armação acetato e lentes espelhadas, inspirado nos clássicos dos anos 70. Proteção UV total.',
    price: 89.90,
    imageUrl: '/products/oculos-vintage.jpg',
    imageHint: '70s acetate frame sunglasses vintage',
    type: 'acessorio',
    style: 'retro',
    colors: ['dourado', 'tartaruga', 'preto'],
    isNewArrival: true,
  },
  {
    id: '9',
    name: 'Vestido Slip Dress Anos 90',
    description: 'Slip dress em cetim, tendência icônica dos anos 90. Minimalista e elegante, perfeito para eventos noturnos.',
    price: 155.00,
    imageUrl: '/products/slip-dress.jpg',
    imageHint: '90s satin slip dress minimalist',
    type: 'vestido',
    style: 'anos-90',
    colors: ['champagne', 'preto', 'verde'],
  },
  {
    id: '10',
    name: 'Blusa Bordada Boho Vintage',
    description: 'Blusa com bordados artesanais e detalhes em macramê. Estilo boho-chic com influência vintage.',
    price: 135.00,
    imageUrl: '/products/blusa-bordada.jpg',
    imageHint: 'embroidered boho vintage blouse macrame details',
    type: 'blusa',
    style: 'boho-vintage',
    colors: ['off-white', 'terracota', 'mostarda'],
  },
  {
    id: '11',
    name: 'Casaco de Lã Oversized',
    description: 'Casaco oversized em lã pura, corte masculino adaptado. Aquece com estilo durante o inverno.',
    price: 285.00,
    imageUrl: '/products/casaco-la.jpg',
    imageHint: 'oversized wool coat masculine cut vintage',
    type: 'casaco',
    style: 'vintage',
    colors: ['camel', 'cinza', 'preto'],
  },
  {
    id: '12',
    name: 'Bolsa Hobo Boho Vintage',
    description: 'Bolsa hobo em couro macio com franjas e detalhes metálicos. Estilo despojado com toque vintage.',
    price: 175.50,
    imageUrl: '/products/bolsa-hobo.jpg',
    imageHint: 'soft leather hobo bag with fringes boho vintage',
    type: 'bolsa',
    style: 'boho-vintage',
    colors: ['caramelo', 'marrom', 'preto'],
    isPromotion: true,
    promotionDetails: '15% OFF - Coleção Boho!',
  },
  {
    id: '13',
    name: 'Calça Jeans Mom Vintage',
    description: 'Calça jeans mom fit com lavagem autêntica vintage. Cintura alta e caimento descontraído.',
    price: 145.00,
    imageUrl: '/products/jeans-mom.jpg',
    imageHint: 'mom fit vintage wash jeans high waist',
    type: 'calca',
    style: 'vintage',
    colors: ['azul desbotado', 'azul escuro', 'preto'],
    isNewArrival: true,
  },
  {
    id: '14',
    name: 'Saia Envelope Floral',
    description: 'Saia envelope com estampa floral delicada, amarração lateral. Romântica e feminina.',
    price: 115.90,
    imageUrl: '/products/saia-envelope.jpg',
    imageHint: 'wrap skirt floral print romantic vintage',
    type: 'saia',
    style: 'retro',
    colors: ['rosa', 'azul', 'verde'],
  },
  {
    id: '15',
    name: 'Cinto de Corrente Dourado',
    description: 'Cinto de corrente com detalhes dourados, acessório statement dos anos 80. Ajustável e versátil.',
    price: 65.00,
    imageUrl: '/products/cinto-corrente.jpg',
    imageHint: 'golden chain belt 80s statement accessory',
    type: 'acessorio',
    style: 'anos-80',
    colors: ['dourado', 'prateado', 'bronze'],
  },
];

// Dados dos testemunhos
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

// Categorias de produtos
export const categories = [
  { name: 'vestidos', label: 'Vestidos', count: 3 },
  { name: 'blusas', label: 'Blusas', count: 2 },
  { name: 'acessórios', label: 'Acessórios', count: 2 },
  { name: 'bolsas', label: 'Bolsas', count: 2 },
  { name: 'conjuntos', label: 'Conjuntos', count: 1 },
  { name: 'vintage', label: 'Vintage', count: 15 },
];

export const uniqueTypes = Array.from(new Set(products.map(p => p.type)));
export const uniqueStyles = Array.from(new Set(products.map(p => p.style)));
export const uniqueColors = Array.from(new Set(products.flatMap(p => p.colors)));
