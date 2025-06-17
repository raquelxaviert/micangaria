'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { CartManager } from '@/lib/ecommerce';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const externalRef = searchParams.get('external_ref');

  useEffect(() => {
    // Limpar o carrinho após pagamento bem-sucedido
    CartManager.clearCart();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Pagamento Aprovado!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Seu pedido foi recebido e está sendo processado. Você receberá um e-mail com os detalhes da sua compra.
            </p>
            {externalRef && (
              <p className="text-sm text-muted-foreground">
                Número do pedido: {externalRef}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/products')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Continuar Comprando
              </Button>
              <Button
                onClick={() => router.push('/account/orders')}
                className="w-full sm:w-auto"
              >
                Ver Meus Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
