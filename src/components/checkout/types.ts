// Tipos para o checkout
export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  document?: string;
}

export interface CheckoutAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

export interface CheckoutShipping {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryTime: string;
  description: string;
}

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  weight?: number;
}

export interface CheckoutData {
  items: CheckoutItem[];
  customer: CheckoutCustomer;
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  shipping?: CheckoutShipping;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export type CheckoutStep = 'customer' | 'address' | 'shipping' | 'payment' | 'confirmation';

export interface CheckoutContextType {
  data: CheckoutData;
  currentStep: CheckoutStep;
  isLoading: boolean;
  updateCustomer: (customer: CheckoutCustomer) => void;
  updateShippingAddress: (address: CheckoutAddress) => void;
  updateShipping: (shipping: CheckoutShipping) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: CheckoutStep) => void;
}
