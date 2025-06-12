'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, QrCode, Banknote, Shield, Clock, CheckCircle } from 'lucide-react';
import { createPaymentPreference, createPixPayment } from '@/lib/payment';

interface PaymentComponentProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shippingCost: number;
  customerData: {
    email: string;
    firstName: string;
    lastName: string;
    cpf?: string;
  };
  onPaymentSuccess?: (paymentId: string) => void;
}

export default function PaymentComponent({ 
  items, 
  shippingCost, 
  customerData, 
  onPaymentSuccess 
}: PaymentComponentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingCost;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleCardPayment = async () => {
    setLoading(true);
    
    try {
      const preference = {
        items: items.map(item => ({
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          description: `${item.name} - RÜGE Vintage`,
          picture_url: item.image
        })),
        payer: {
          email: customerData.email,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          identification: customerData.cpf ? {
            type: 'CPF' as const,
            number: customerData.cpf
          } : undefined
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`
        },
        auto_return: 'approved' as const,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        },
        notification_url: `${window.location.origin}/api/payment/webhook`
      };      // Se houver frete, adicionar como item separado
      if (shippingCost > 0) {
        preference.items.push({
          title: 'Frete',
          unit_price: shippingCost,
          quantity: 1,
          description: 'Custo de entrega',
          picture_url: undefined
        });
      }

      const response = await createPaymentPreference(preference);
      
      if (response.init_point) {
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = response.init_point;
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePixPayment = async () => {
    setLoading(true);
    
    try {
      const pixPayment = await createPixPayment({
        amount: total,
        description: `Compra RÜGE - ${items.length} item(s)`,
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        identificationType: 'CPF',
        identificationNumber: customerData.cpf
      });

      setPixData(pixPayment);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      alert('Erro ao gerar pagamento PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      alert('Código PIX copiado!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qtd: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            {shippingCost > 0 && (
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métodos de Pagamento */}
      {!paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Escolha a Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PIX */}
            <div
              className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setPaymentMethod('pix')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <QrCode className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">PIX</h3>
                    <p className="text-sm text-muted-foreground">
                      Pagamento instantâneo
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 mb-1">
                    5% de desconto
                  </Badge>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(total * 0.95)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cartão de Crédito */}
            <div
              className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setPaymentMethod('card')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Cartão de Crédito</h3>
                    <p className="text-sm text-muted-foreground">
                      Parcele em até 12x sem juros
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatPrice(total)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    12x de {formatPrice(total / 12)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagamento PIX */}
      {paymentMethod === 'pix' && !pixData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Pagamento PIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Desconto de 5% aplicado!</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(total * 0.95)}
              </p>
            </div>

            <Button 
              onClick={handlePixPayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Gerando PIX...' : 'Gerar Código PIX'}
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Pagamento 100% seguro via Mercado Pago</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exibir QR Code PIX */}
      {pixData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              PIX Gerado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={pixData.qr_code_base64}
                alt="QR Code PIX"
                className="mx-auto mb-4"
              />
              
              <Button 
                onClick={copyPixCode}
                variant="outline"
                className="w-full"
              >
                Copiar Código PIX
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Instruções:</span>
              </div>
              <ul className="text-sm text-blue-600 text-left space-y-1">
                <li>1. Abra seu banco ou carteira digital</li>
                <li>2. Escaneie o QR Code ou cole o código</li>
                <li>3. Confirme o pagamento</li>
                <li>4. Pronto! Você receberá a confirmação por email</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              O código PIX expira em 30 minutos
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagamento Cartão */}
      {paymentMethod === 'card' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pagamento com Cartão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">
                Parcelamento disponível:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>1x de {formatPrice(total)}</span>
                <span>2x de {formatPrice(total / 2)}</span>
                <span>3x de {formatPrice(total / 3)}</span>
                <span>6x de {formatPrice(total / 6)}</span>
                <span>10x de {formatPrice(total / 10)}</span>
                <span>12x de {formatPrice(total / 12)}</span>
              </div>
            </div>

            <Button 
              onClick={handleCardPayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processando...' : 'Pagar com Cartão'}
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Checkout seguro do Mercado Pago</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voltar */}
      {paymentMethod && (
        <Button 
          variant="outline" 
          onClick={() => {
            setPaymentMethod(null);
            setPixData(null);
          }}
          className="w-full"
        >
          Escolher Outro Método
        </Button>
      )}
    </div>
  );
}
