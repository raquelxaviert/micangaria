'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CheckoutContextType, CheckoutData, CheckoutStep, CheckoutCustomer, CheckoutAddress, CheckoutShipping } from './types';
import { CartManager } from '@/lib/ecommerce';
import { useAuth } from '@/contexts/AuthContext';

// Estado inicial
const initialData: CheckoutData = {
  items: [],
  customer: {
    name: '',
    email: '',
    phone: '',
  },
  shippingAddress: {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'BR',
  },
  subtotal: 0,
  shippingCost: 0,
  total: 0,
};

// Actions
type CheckoutAction = 
  | { type: 'LOAD_CART' }
  | { type: 'LOAD_SAVED_SESSION'; payload: any }
  | { type: 'UPDATE_CUSTOMER'; payload: CheckoutCustomer }
  | { type: 'UPDATE_SHIPPING_ADDRESS'; payload: CheckoutAddress }
  | { type: 'UPDATE_SHIPPING'; payload: CheckoutShipping }
  | { type: 'SET_STEP'; payload: CheckoutStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
function checkoutReducer(state: any, action: CheckoutAction) {
  switch (action.type) {
    case 'LOAD_CART': {
      const cartItems = CartManager.getCart();
      const items = cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...state,
        data: {
          ...state.data,
          items,
          subtotal,
          total: subtotal + state.data.shippingCost,
        },
      };
    }
    
    case 'LOAD_SAVED_SESSION': {
      const session = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          customer: session.customer_data || state.data.customer,
          shippingAddress: session.shipping_address || state.data.shippingAddress,
          shipping: session.shipping_option || undefined,
          shippingCost: session.shipping_option?.price || 0,
          total: state.data.subtotal + (session.shipping_option?.price || 0),
        },
        currentStep: session.step || 'customer',
      };
    }
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        data: {
          ...state.data,
          customer: action.payload,
        },
      };
    
    case 'UPDATE_SHIPPING_ADDRESS':
      return {
        ...state,
        data: {
          ...state.data,
          shippingAddress: action.payload,
        },
      };
    
    case 'UPDATE_SHIPPING':
      return {
        ...state,
        data: {
          ...state.data,
          shipping: action.payload,
          shippingCost: action.payload.price,
          total: state.data.subtotal + action.payload.price,
        },
      };
    
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    
    case 'NEXT_STEP': {
      const steps: CheckoutStep[] = ['customer', 'address', 'shipping', 'payment', 'confirmation'];
      const currentIndex = steps.indexOf(state.currentStep);
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
      return {
        ...state,
        currentStep: steps[nextIndex],
      };
    }
    
    case 'PREV_STEP': {
      const steps: CheckoutStep[] = ['customer', 'address', 'shipping', 'payment', 'confirmation'];
      const currentIndex = steps.indexOf(state.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return {
        ...state,
        currentStep: steps[prevIndex],
      };
    }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
}

// Context
const CheckoutContext = createContext<CheckoutContextType | null>(null);

// Provider
export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, {
    data: initialData,
    currentStep: 'customer' as CheckoutStep,
    isLoading: false,
  });

  const { user } = useAuth();

  // Carregar carrinho e sessão salva na inicialização
  useEffect(() => {
    dispatch({ type: 'LOAD_CART' });
    
    if (user) {
      loadSavedSession();
    }
  }, [user]);

  // Função para carregar sessão salva
  const loadSavedSession = async () => {
    try {
      const response = await fetch('/api/checkout/session');
      const result = await response.json();
      
      if (result.success && result.session) {
        console.log('✅ Sessão de checkout restaurada:', result.session);
        dispatch({ type: 'LOAD_SAVED_SESSION', payload: result.session });
      }
    } catch (error) {
      console.error('Erro ao carregar sessão salva:', error);
    }
  };

  // Função para salvar sessão automaticamente
  const saveSession = async (step: CheckoutStep, data: CheckoutData) => {
    if (!user) return; // Só salvar se usuário estiver logado

    try {
      const sessionData = {
        step,
        cart_items: data.items,
        customer_data: data.customer,
        shipping_address: data.shippingAddress,
        shipping_option: data.shipping || null,
      };

      await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      console.log('💾 Sessão de checkout salva automaticamente');
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  // Salvar automaticamente quando dados mudarem
  useEffect(() => {
    if (user && state.data.items.length > 0) {
      const timeoutId = setTimeout(() => {
        saveSession(state.currentStep, state.data);
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timeoutId);
    }
  }, [user, state.currentStep, state.data]);

  const value: CheckoutContextType = {
    data: state.data,
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    
    updateCustomer: (customer: CheckoutCustomer) => {
      dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
    },
    
    updateShippingAddress: (address: CheckoutAddress) => {
      dispatch({ type: 'UPDATE_SHIPPING_ADDRESS', payload: address });
    },
    
    updateShipping: (shipping: CheckoutShipping) => {
      dispatch({ type: 'UPDATE_SHIPPING', payload: shipping });
    },
    
    nextStep: () => {
      dispatch({ type: 'NEXT_STEP' });
    },
    
    prevStep: () => {
      dispatch({ type: 'PREV_STEP' });
    },
    
    goToStep: (step: CheckoutStep) => {
      dispatch({ type: 'SET_STEP', payload: step });
    },
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

// Hook
export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
