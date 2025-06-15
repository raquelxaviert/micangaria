// Re-export all checkout components for easy importing

export { CheckoutProvider, useCheckout } from './CheckoutContext';
export { CheckoutProgress } from './CheckoutProgress';
export { CustomerStep } from './CustomerStep';
export { AddressStep } from './AddressStep';
export { ShippingStep } from './ShippingStep';
export { PaymentStep } from './PaymentStep';
export { OrderSummary } from './OrderSummary';

// Export types
export type {
  CheckoutCustomer,
  CheckoutAddress,
  CheckoutShipping,
  CheckoutItem,
  CheckoutData,
  CheckoutStep,
  CheckoutContextType,
} from './types';
