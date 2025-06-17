'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export default function CheckoutPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const externalRef = searchParams.get('external_ref');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Pagamento em Processamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail assim que o pagamento for aprovado.
            </p>
            {externalRef && (
              <p className="text-sm text-muted-foreground">
                Número do pedido: {externalRef}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Continuar Comprando
              </Button>
              <Button
                onClick={() => router.push('/orders')}
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
