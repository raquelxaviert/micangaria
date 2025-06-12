'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ShippingCalculator from '@/components/ShippingCalculator';
import PaymentComponent from '@/components/PaymentComponent';
import { ShoppingCart, Package, CreditCard } from 'lucide-react';

// Exemplo de produtos para demonstração
const sampleProducts = [
  {
    id: '1',
    name: 'Vestido Vintage Anos 80',
    type: 'vestido',
    price: 189.90,
    quantity: 1,
    image: '/products/vestido-vintage.jpg'
  },
  {
    id: '2', 
    name: 'Blusa Saint Laurent Vintage',
    type: 'blusa',
    price: 299.90,
    quantity: 1,
    image: '/products/blusa-saint-laurent.jpg'
  }
];

// Exemplo de dados do cliente
const sampleCustomer = {
  email: 'cliente@exemplo.com',
  firstName: 'Maria',
  lastName: 'Silva',
  cpf: '12345678909'
};

export default function CheckoutDemo() {
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(0);

  const handleShippingSelect = (shippingOption: any) => {
    setSelectedShipping(shippingOption);
    setShippingCost(parseFloat(shippingOption.custom_price || shippingOption.price));
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (paymentId: string) => {
    alert(`Pagamento realizado com sucesso! ID: ${paymentId}`);
    // Aqui você redirecionaria para uma página de sucesso
  };

  const subtotal = sampleProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">
            Demonstração do sistema de pagamentos e frete
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === 'shipping' ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              <Package className="w-4 h-4" />
              <span>Frete</span>
            </div>
            <div className="w-8 h-px bg-muted" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === 'payment' ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              <CreditCard className="w-4 h-4" />
              <span>Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Resumo do Pedido - Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Produtos */}
                {sampleProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {product.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Totais */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  {shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Informações do Frete Selecionado */}
                {selectedShipping && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-100 text-green-700">
                        Frete Selecionado
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{selectedShipping.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedShipping.company.name} - {selectedShipping.delivery_time} dias úteis
                    </p>
                  </div>
                )}

                {/* Badges de Segurança */}
                <div className="pt-4 space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    🔒 Pagamento 100% Seguro
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center">
                    📦 Frete com Rastreamento
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center">
                    ↩️ 30 dias para Trocas
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            
            {/* Etapa 1: Cálculo de Frete */}
            {currentStep === 'shipping' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Calcular Frete</h2>
                  <p className="text-muted-foreground">
                    Informe seu CEP para calcular o frete e prazo de entrega
                  </p>
                </div>

                <ShippingCalculator
                  products={sampleProducts}
                  onShippingSelect={handleShippingSelect}
                />
              </div>
            )}

            {/* Etapa 2: Pagamento */}
            {currentStep === 'payment' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Finalizar Pagamento</h2>
                  <p className="text-muted-foreground">
                    Escolha sua forma de pagamento preferida
                  </p>
                </div>

                <PaymentComponent
                  items={sampleProducts}
                  shippingCost={shippingCost}
                  customerData={sampleCustomer}
                  onPaymentSuccess={handlePaymentSuccess}
                />

                {/* Voltar para Frete */}
                <div className="mt-6">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="text-primary hover:underline text-sm"
                  >
                    ← Voltar para cálculo de frete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                💡 Esta é uma demonstração
              </h3>
              <p className="text-blue-700 text-sm">
                Esta página demonstra como funciona o sistema de pagamentos e frete.
                Para usar em produção, configure suas credenciais do Mercado Pago e Melhor Envio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
