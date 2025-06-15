'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutProvider, useCheckout } from '@/components/checkout/CheckoutContext';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { CustomerStep } from '@/components/checkout/CustomerStep';
import { AddressStep } from '@/components/checkout/AddressStep';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { CartManager } from '@/lib/ecommerce';

function CheckoutContent() {
  const { data, currentStep } = useCheckout();
  const router = useRouter();

  // Verificar se há items no carrinho
  useEffect(() => {
    const cartItems = CartManager.getCart();
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [router]);

  const renderStep = () => {
    switch (currentStep) {
      case 'customer':
        return <CustomerStep />;
      case 'address':
        return <AddressStep />;
      case 'shipping':
        return <ShippingStep />;
      case 'payment':
        return <PaymentStep />;
      default:
        return <CustomerStep />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'customer':
        return 'Identificação';
      case 'address':  
        return 'Endereço de Entrega';
      case 'shipping':
        return 'Opções de Frete';
      case 'payment':
        return 'Pagamento';
      default:
        return 'Checkout';
    }
  };

  if (data.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-headline text-primary">Carrinho Vazio</h1>
          <p className="text-muted-foreground">
            Adicione produtos ao carrinho antes de finalizar a compra.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/products">
              Explorar Produtos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao carrinho
          </Link>
          <h1 className="text-3xl font-headline text-primary">Finalizar Compra</h1>
          <p className="text-muted-foreground mt-2">{getStepTitle()}</p>
        </div>

        {/* Progress */}
        <CheckoutProgress />

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {renderStep()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
