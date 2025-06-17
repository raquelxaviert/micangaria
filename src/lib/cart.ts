interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

class CartManager {
  private static readonly CART_KEY = 'micangaria_cart';

  static getItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const items = localStorage.getItem(this.CART_KEY);
    return items ? JSON.parse(items) : [];
  }

  static addItem(item: Omit<CartItem, 'quantity'>): boolean {
    const items = this.getItems();
    const existingItem = items.find(i => i.productId === item.productId);
    
    // Se o produto já existe no carrinho, não adiciona (peças únicas)
    if (existingItem) {
      return false;
    }
    
    items.push({ ...item, quantity: 1 });
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this.notifyCartChange();
    return true;
  }

  static removeItem(productId: string) {
    const items = this.getItems();
    const updatedItems = items.filter(item => item.productId !== productId);
    localStorage.setItem(this.CART_KEY, JSON.stringify(updatedItems));
    this.notifyCartChange();
  }

  static updateQuantity(productId: string, quantity: number) {
    const items = this.getItems();
    const item = items.find(i => i.productId === productId);
    
    if (item) {
      item.quantity = quantity;
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
      this.notifyCartChange();
    }
  }

  static clear() {
    localStorage.removeItem(this.CART_KEY);
    this.notifyCartChange();
  }

  static getTotal(): number {
    const items = this.getItems();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  static isInCart(productId: string): boolean {
    const items = this.getItems();
    return items.some(item => item.productId === productId);
  }

  private static notifyCartChange(): void {
    window.dispatchEvent(new CustomEvent('cartChanged'));
  }
}

export { CartManager, type CartItem }; 