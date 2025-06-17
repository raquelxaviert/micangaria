'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function CheckoutFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const externalRef = searchParams.get('external_ref');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Pagamento Não Aprovado</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Houve um problema ao processar seu pagamento. Por favor, tente novamente ou escolha outro método de pagamento.
            </p>
            {externalRef && (
              <p className="text-sm text-muted-foreground">
                Número do pedido: {externalRef}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/cart')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Voltar ao Carrinho
              </Button>
              <Button
                onClick={() => router.push('/checkout')}
                className="w-full sm:w-auto"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
