'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';

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
    <Button
      onClick={handlePayment}
      className="w-full"
      disabled={isLoading || !shippingOption}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Processando...
        </div>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pagar com Mercado Pago
        </>
      )}
    </Button>
  );
} 