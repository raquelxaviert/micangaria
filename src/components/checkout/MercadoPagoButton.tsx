'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CartManager } from '@/lib/cart';

interface ShippingOption {
  name: string;
  price: number;
  deadline: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface ShippingAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface MercadoPagoButtonProps {
  amount: number;
  shippingOption: ShippingOption | null;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
}

export default function MercadoPagoButton({
  amount,
  shippingOption,
  customerInfo,
  shippingAddress,
}: MercadoPagoButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // Validar dados necessários
      if (!shippingOption) {
        toast({
          title: "Erro ao processar pagamento",
          description: "Selecione uma opção de frete antes de continuar.",
          variant: "destructive",
        });
        return;
      }

      if (!customerInfo.name || !customerInfo.email || !customerInfo.cpf) {
        toast({
          title: "Erro ao processar pagamento",
          description: "Preencha todos os dados pessoais antes de continuar.",
          variant: "destructive",
        });
        return;
      }

      if (!shippingAddress.zipCode || !shippingAddress.street || !shippingAddress.number) {
        toast({
          title: "Erro ao processar pagamento",
          description: "Preencha todos os dados de entrega antes de continuar.",
          variant: "destructive",
        });
        return;
      }

      // Obter itens do carrinho
      const cartItems = CartManager.getItems().map((item: CartItem) => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL'
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          shippingOption,
          customerInfo,
          shippingAddress,
          items: cartItems,
          userId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de pagamento não encontrada');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível criar a preferência de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Finalizar Pagamento</h4>
        <p className="text-sm text-gray-600">
          Você será redirecionado para o Mercado Pago para concluir sua compra de forma segura
        </p>
      </div>
        <Button
        onClick={handlePayment}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
        disabled={isLoading || !shippingOption}
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Redirecionando...
          </div>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pagar R$ {amount.toFixed(2)} - Mercado Pago
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>🔒 Pagamento 100% seguro</span>
        <span>•</span>
        <span>✓ Dados protegidos</span>
      </div>
    </div>
  );
}