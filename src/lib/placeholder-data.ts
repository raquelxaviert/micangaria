export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  type: 'pulseira' | 'brinco';
  style: 'boho' | 'indígena' | 'boho-chic';
  colors: string[];
  isNewArrival?: boolean;
  isPromotion?: boolean;
  promotionDetails?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Pulseira Brilho do Sol Poente',
    description: 'Pulseira indígena tecida à mão, refletindo as cores vibrantes de um pôr do sol brasileiro.',
    price: 25.99,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'indigenous bracelet',
    type: 'pulseira',
    style: 'indígena',
    colors: ['vermelho', 'laranja', 'amarelo'],
    isNewArrival: true,
  },
  {
    id: '2',
    name: 'Brincos Apanhador de Sonhos Boho',
    description: 'Elegantes brincos inspirados em apanhadores de sonhos com detalhes de penas, perfeitos para um look boho.',
    price: 19.50,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'boho earring',
    type: 'brinco',
    style: 'boho',
    colors: ['marrom', 'azul petróleo', 'branco'],
  },
  {
    id: '3',
    name: 'Pulseira de Sementes Amazônicas',
    description: 'Uma pulseira única feita com sementes amazônicas de origem sustentável e fibras naturais.',
    price: 32.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'seed bracelet',
    type: 'pulseira',
    style: 'indígena',
    colors: ['verde', 'marrom', 'bege'],
    isPromotion: true,
    promotionDetails: '20% de Desconto Esta Semana!',
  },
  {
    id: '4',
    name: 'Brincos de Tassel Espírito Livre',
    description: 'Brincos longos de tassel que balançam com seu movimento, incorporando um estilo de espírito livre.',
    price: 22.75,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'tassel earring',
    type: 'brinco',
    style: 'boho-chic',
    colors: ['creme', 'dourado', 'rosa'],
    isNewArrival: true,
  },
  {
    id: '5',
    name: 'Pulseira Trama da Terra',
    description: 'Pulseira intricadamente tecida com tons terrosos e padrões geométricos indígenas.',
    price: 28.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'woven bracelet',
    type: 'pulseira',
    style: 'indígena',
    colors: ['marrom', 'preto', 'bege'],
  },
  {
    id: '6',
    name: 'Brincos de Argola Luar',
    description: 'Brincos de argola estilo boho com pingentes delicados e um toque de pedra da lua.',
    price: 24.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'hoop earring',
    type: 'brinco',
    style: 'boho',
    colors: ['prata', 'azul', 'branco'],
  },
   {
    id: '7',
    name: 'Bracelete Padrão Tribal',
    description: 'Bracelete robusto apresentando padrões indígenas tradicionais em cores marcantes.',
    price: 35.50,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'cuff bracelet',
    type: 'pulseira',
    style: 'indígena',
    colors: ['preto', 'vermelho', 'branco'],
    isPromotion: true,
    promotionDetails: 'Edição Limitada!',
  },
  {
    id: '8',
    name: 'Brincos de Macramê Folha',
    description: 'Brincos de macramê feitos à mão em um delicado design de folha, perfeitos para amantes do estilo natural.',
    price: 18.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'macrame earring',
    type: 'brinco',
    style: 'boho-chic',
    colors: ['verde', 'bege'],
    isNewArrival: true,
  }
];

export const uniqueTypes = Array.from(new Set(products.map(p => p.type)));
export const uniqueStyles = Array.from(new Set(products.map(p => p.style)));
export const uniqueColors = Array.from(new Set(products.flatMap(p => p.colors)));
