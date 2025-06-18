'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const externalRef = searchParams.get('external_reference') || searchParams.get('external_ref');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Atualizar status do pedido se necessário
    if (externalRef && paymentId) {
      updateOrderStatus();
    }
  }, [externalRef, paymentId]);

  const updateOrderStatus = async () => {
    if (!externalRef || !paymentId) return;
    
    setIsUpdating(true);
    try {
      const supabase = createClient();
      
      // Buscar o pedido pelo external_reference
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('external_reference', externalRef)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar pedido:', fetchError);
        return;
      }

      if (order) {
        setOrderDetails(order);
        
        // Atualizar payment_id se ainda não estiver definido
        if (!order.payment_id) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_id: paymentId,
              updated_at: new Date().toISOString(),
            })
            .eq('external_reference', externalRef);

          if (updateError) {
            console.error('Erro ao atualizar payment_id do pedido:', updateError);
          } else {
            console.log('Payment ID atualizado no pedido');
            setOrderDetails((prev: any) => ({ ...prev, payment_id: paymentId }));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
    } finally {
      setIsUpdating(false);
    }
  };

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
            {isUpdating ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando seu pedido...</span>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail assim que o pagamento for aprovado.
                </p>
                {externalRef && (
                  <p className="text-sm text-muted-foreground">
                    Número do pedido: {externalRef}
                  </p>
                )}
                {paymentId && (
                  <p className="text-sm text-muted-foreground">
                    ID do pagamento: {paymentId}
                  </p>
                )}
                {orderDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <h4 className="font-semibold mb-2">Detalhes do Pedido:</h4>
                    <p className="text-sm">Status: <span className="font-medium text-yellow-600">{orderDetails.status === 'pending' ? 'Pendente' : orderDetails.status}</span></p>
                    <p className="text-sm">Total: R$ {orderDetails.total?.toFixed(2)}</p>
                    <p className="text-sm">Data: {new Date(orderDetails.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </>
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
                onClick={() => router.push('/minha-conta/pedidos')}
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
