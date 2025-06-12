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

  static addItem(item: Omit<CartItem, 'quantity'>): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(i => i.productId === item.productId);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.notifyCartChange();
  }

  static removeItem(productId: string): void {
    const cart = this.getCart().filter(item => item.productId !== productId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.notifyCartChange();
  }

  static updateQuantity(productId: string, quantity: number): void {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(i => i.productId === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
      this.notifyCartChange();
    }
  }

  static clearCart(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyCartChange();
  }

  static getTotal(): number {
    return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  static getItemCount(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  }

  private static notifyCartChange(): void {
    window.dispatchEvent(new CustomEvent('cartChanged'));
  }
}

// Payment Processing - Now using Mercado Pago
// These functions are handled by the new checkout flow
