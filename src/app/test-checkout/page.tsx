'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function TestCheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const testProduct = {
    id: 'test-product-1',
    name: 'Produto Teste - Colar Dourado',
    price: 89.90,
    image: '/products/colar.jpg',
    quantity: 1
  };

  const testShipping = {
    type: 'sedex',
    name: 'SEDEX',
    price: 15.00,
    time: '3-5 dias'
  };

  const testCustomer = {
    name: 'João Silva',
    email: 'joao@teste.com',
    phone: '11999999999',
    document: '12345678909'
  };

  const testAddress = {
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
  };

  const handleTestPayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🧪 Iniciando teste de pagamento...');
      
      const paymentData = {
        items: [{
          id: testProduct.id,
          title: testProduct.name,
          quantity: testProduct.quantity,
          unit_price: testProduct.price,
          currency_id: 'BRL'
        }],
        shippingOption: testShipping,
        customerInfo: testCustomer,
        shippingAddress: testAddress
      };

      console.log('📦 Dados do pagamento:', paymentData);

      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      console.log('📋 Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro da API:', errorData);
        throw new Error(errorData.details || 'Erro ao processar pagamento');
      }

      const data = await response.json();
      console.log('✅ Resposta do Mercado Pago:', data);
      
      // Usar sandbox_init_point em desenvolvimento
      const paymentUrl = data.sandbox_init_point || data.init_point;
      
      if (!paymentUrl) {
        console.error('❌ URLs disponíveis:', { 
          sandbox_init_point: data.sandbox_init_point, 
          init_point: data.init_point 
        });
        throw new Error('URL de pagamento não recebida');
      }

      console.log('🔗 Redirecionando para:', paymentUrl);
      
      // Abrir em uma nova aba para facilitar o teste
      window.open(paymentUrl, '_blank');
      
      toast({
        title: "Checkout criado com sucesso!",
        description: "O checkout foi aberto em uma nova aba. Verifique se Pix e Nubank aparecem como opções.",
      });
      
    } catch (error: any) {
      console.error('❌ Erro no pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🧪 Teste de Checkout - Mercado Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Produto de Teste */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Produto de Teste</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  📿
                </div>
                <div>
                  <p className="font-medium">{testProduct.name}</p>
                  <p className="text-sm text-gray-600">Quantidade: {testProduct.quantity}</p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {testProduct.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Frete */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Frete</h3>
              <p>{testShipping.name} - R$ {testShipping.price.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Prazo: {testShipping.time}</p>
            </div>

            {/* Total */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  R$ {(testProduct.price + testShipping.price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Dados do Cliente (Teste)</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Nome:</strong> {testCustomer.name}</p>
                <p><strong>Email:</strong> {testCustomer.email}</p>
                <p><strong>Telefone:</strong> {testCustomer.phone}</p>
                <p><strong>CPF:</strong> {testCustomer.document}</p>
              </div>
            </div>

            {/* Endereço */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Endereço de Entrega (Teste)</h3>
              <p className="text-sm">{testAddress.street}</p>
              <p className="text-sm">{testAddress.city}, {testAddress.state} - {testAddress.zipCode}</p>
            </div>

            {/* Botão de Teste */}
            <Button 
              onClick={handleTestPayment}
              disabled={isProcessing}
              className="w-full h-12 text-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Criando checkout...
                </>
              ) : (
                <>
                  🧪 Testar Checkout - Verificar Pix e Nubank
                </>
              )}
            </Button>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Instruções de Teste</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. Clique no botão acima para criar o checkout</li>
                <li>2. Uma nova aba será aberta com o checkout do Mercado Pago</li>
                <li>3. Verifique se <strong>Pix</strong> e <strong>Nubank</strong> aparecem como opções</li>
                <li>4. Teste um pagamento se desejar (ambiente sandbox)</li>
                <li>5. Confira os logs no console do navegador</li>
              </ul>
            </div>

            {/* Informações Técnicas */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🔧 Informações Técnicas</h3>
              <div className="text-sm space-y-1">
                <p><strong>Ambiente:</strong> Sandbox (Teste)</p>
                <p><strong>Endpoint:</strong> /api/checkout/create-preference</p>
                <p><strong>Métodos esperados:</strong> Pix, Nubank, Cartões</p>
                <p><strong>Auto-return:</strong> Desabilitado para localhost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
