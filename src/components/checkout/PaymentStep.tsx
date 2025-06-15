'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, QrCode, Loader2, Shield } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export function PaymentStep() {
  const { data, prevStep } = useCheckout();
  const { toast } = useToast();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  const paymentMethods = [
    {
      id: 'pix' as PaymentMethod,
      name: 'PIX',
      icon: Smartphone,
      description: 'Pagamento instantâneo',
      discount: '5% de desconto',
      time: 'Aprovação imediata'
    },
    {
      id: 'credit_card' as PaymentMethod,
      name: 'Cartão de Crédito',
      icon: CreditCard,
      description: 'Parcelamento em até 12x',
      discount: null,
      time: 'Aprovação em até 2 minutos'
    },
    {
      id: 'boleto' as PaymentMethod,
      name: 'Boleto Bancário',
      icon: QrCode,
      description: 'Vencimento em 3 dias úteis',
      discount: null,
      time: 'Aprovação em 1-2 dias úteis'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Selecione o método de pagamento",
        description: "Escolha como deseja pagar sua compra.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Preparar dados para o pagamento
      const paymentData = {
        items: data.items.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          picture_url: item.imageUrl
        })),
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone
        },
        shipping: {
          cost: data.shippingCost,
          address: data.shippingAddress
        },
        payment_method: selectedMethod,
        total: data.total
      };

      if (selectedMethod === 'pix') {
        // Processar PIX
        const response = await fetch('/api/payment/create-pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        const result = await response.json();

        if (result.success) {
          setPixData(result.pix);
          toast({
            title: "PIX gerado com sucesso!",
            description: "Use o código PIX ou QR Code para pagar.",
          });
        } else {
          throw new Error(result.error || 'Erro ao gerar PIX');
        }
      } else {
        // Processar cartão ou boleto via Mercado Pago
        const response = await fetch('/api/checkout/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        const result = await response.json();

        if (result.init_point) {
          // Redirecionar para o Mercado Pago
          window.location.href = result.init_point;
        } else {
          throw new Error('Erro ao criar preferência de pagamento');
        }
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente ou escolha outro método.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDiscountedTotal = () => {
    if (selectedMethod === 'pix') {
      return data.total * 0.95; // 5% desconto
    }
    return data.total;
  };

  if (pixData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Pagamento PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">PIX gerado com sucesso!</h3>
              <p className="text-sm text-green-700">
                Use o QR Code ou copie o código PIX para finalizar o pagamento.
              </p>
            </div>

            {/* QR Code mockado - substitua pela imagem real */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Código PIX:</p>
              <div className="bg-gray-100 p-3 rounded border text-xs font-mono break-all">
                {pixData.qr_code || 'PIX_CODE_PLACEHOLDER_123456'}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(pixData.qr_code || 'PIX_CODE_PLACEHOLDER_123456')}
              >
                Copiar Código PIX
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm space-y-1">
                <p><strong>Valor:</strong> R$ {getDiscountedTotal().toFixed(2)}</p>
                <p><strong>Desconto PIX:</strong> R$ {(data.total - getDiscountedTotal()).toFixed(2)}</p>
                <p><strong>Vencimento:</strong> 30 minutos</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPixData(null)} className="flex-1">
              Escolher Outro Método
            </Button>
            <Button onClick={() => window.location.href = '/checkout/pending'} className="flex-1">
              Já Paguei
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <div
                key={method.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                      )}
                    </div>
                    
                    <Icon className="w-5 h-5 text-gray-600" />
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.discount && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            {method.discount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <p className="text-xs text-muted-foreground">{method.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium">Resumo do Pedido</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({data.items.length} {data.items.length === 1 ? 'item' : 'itens'})</span>
              <span>R$ {data.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Frete ({data.shipping?.name})</span>
              <span>
                {data.shippingCost === 0 ? 'GRÁTIS' : `R$ ${data.shippingCost.toFixed(2)}`}
              </span>
            </div>
            
            {selectedMethod === 'pix' && (
              <div className="flex justify-between text-green-600">
                <span>Desconto PIX (5%)</span>
                <span>-R$ {(data.total * 0.05).toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>R$ {getDiscountedTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Pagamento Seguro</h4>
              <p className="text-sm text-blue-700 mt-1">
                Seus dados são protegidos com criptografia SSL e processados pelo Mercado Pago.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
            Voltar ao Frete
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              `Pagar R$ ${getDiscountedTotal().toFixed(2)}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
