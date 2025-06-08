export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  type: 'bracelet' | 'earring';
  style: 'boho' | 'indigenous' | 'boho-chic';
  colors: string[];
  isNewArrival?: boolean;
  isPromotion?: boolean;
  promotionDetails?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Sunset Glow Bracelet',
    description: 'Handwoven indigenous bracelet reflecting the vibrant colors of a Brazilian sunset.',
    price: 25.99,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'indigenous bracelet',
    type: 'bracelet',
    style: 'indigenous',
    colors: ['red', 'orange', 'yellow'],
    isNewArrival: true,
  },
  {
    id: '2',
    name: 'Boho Dreamcatcher Earrings',
    description: 'Elegant dreamcatcher-inspired earrings with feather accents, perfect for a boho look.',
    price: 19.50,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'boho earring',
    type: 'earring',
    style: 'boho',
    colors: ['brown', 'teal', 'white'],
  },
  {
    id: '3',
    name: 'Amazonian Seed Bracelet',
    description: 'A unique bracelet made from sustainably sourced Amazonian seeds and natural fibers.',
    price: 32.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'seed bracelet',
    type: 'bracelet',
    style: 'indigenous',
    colors: ['green', 'brown', 'beige'],
    isPromotion: true,
    promotionDetails: '20% Off This Week!',
  },
  {
    id: '4',
    name: 'Free Spirit Tassel Earrings',
    description: 'Long tassel earrings that sway with your movement, embodying a free-spirited style.',
    price: 22.75,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'tassel earring',
    type: 'earring',
    style: 'boho-chic',
    colors: ['cream', 'gold', 'pink'],
    isNewArrival: true,
  },
  {
    id: '5',
    name: 'Earth Weave Bracelet',
    description: 'Intricately woven bracelet with earthy tones and geometric indigenous patterns.',
    price: 28.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'woven bracelet',
    type: 'bracelet',
    style: 'indigenous',
    colors: ['brown', 'black', 'beige'],
  },
  {
    id: '6',
    name: 'Moonlit Hoop Earrings',
    description: 'Boho-style hoop earrings with delicate charms and a touch of moonstone.',
    price: 24.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'hoop earring',
    type: 'earring',
    style: 'boho',
    colors: ['silver', 'blue', 'white'],
  },
   {
    id: '7',
    name: 'Tribal Pattern Cuff',
    description: 'Bold cuff bracelet featuring traditional indigenous patterns in striking colors.',
    price: 35.50,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'cuff bracelet',
    type: 'bracelet',
    style: 'indigenous',
    colors: ['black', 'red', 'white'],
    isPromotion: true,
    promotionDetails: 'Limited Edition!',
  },
  {
    id: '8',
    name: 'Macrame Leaf Earrings',
    description: 'Handmade macrame earrings in a delicate leaf design, perfect for natural style lovers.',
    price: 18.00,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'macrame earring',
    type: 'earring',
    style: 'boho-chic',
    colors: ['green', 'beige'],
    isNewArrival: true,
  }
];

export const uniqueTypes = Array.from(new Set(products.map(p => p.type)));
export const uniqueStyles = Array.from(new Set(products.map(p => p.style)));
export const uniqueColors = Array.from(new Set(products.flatMap(p => p.colors)));
