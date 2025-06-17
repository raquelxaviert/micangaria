// E-commerce functionality without Stripe
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  trackingCode?: string;
}

// Cart Management
export class CartManager {
  private static STORAGE_KEY = 'micangaria_cart';

  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  static addItem(item: Omit<CartItem, 'quantity'>): boolean {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(i => i.productId === item.productId);
    
    // Se o produto já existe no carrinho, não adiciona (peças únicas)
    if (existingIndex >= 0) {
      return false; // Retorna false indicando que não foi adicionado
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.notifyCartChange();
    return true; // Retorna true indicando que foi adicionado com sucesso
  }

  // Função para verificar se um produto já está no carrinho
  static isInCart(productId: string): boolean {
    const cart = this.getCart();
    return cart.some(item => item.productId === productId);
  }
  static removeItem(productId: string): void {
    const cart = this.getCart().filter(item => item.productId !== productId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.notifyCartChange();
  }

  static clearCart(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyCartChange();
  }

  static getTotal(): number {
    return this.getCart().reduce((total, item) => total + item.price, 0); // Sempre quantidade 1
  }

  static getItemCount(): number {
    return this.getCart().length; // Sempre quantidade 1 por item
  }

  private static notifyCartChange(): void {
    window.dispatchEvent(new CustomEvent('cartChanged'));
  }
}

// Payment Processing - Now using Mercado Pago
// These functions are handled by the new checkout flow
