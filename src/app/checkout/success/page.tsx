'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { CartManager } from '@/lib/ecommerce';
import { createClient } from '@/lib/supabase/client';
import Head from 'next/head';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const externalRef = searchParams.get('external_reference') || searchParams.get('external_ref');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const preferenceId = searchParams.get('preference_id');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [isFromMercadoPago, setIsFromMercadoPago] = useState(false);

  useEffect(() => {
    // Limpar o carrinho após pagamento bem-sucedido
    CartManager.clearCart();
    
    // Verificar se veio do Mercado Pago
    const fromMercadoPago = document.referrer.includes('mercadopago.com') || 
                           document.referrer.includes('mercadopago.com.br');
    
    setIsFromMercadoPago(fromMercadoPago);
    
    console.log('🔍 [SuccessPage] Detected source:', {
      referrer: document.referrer,
      isFromMercadoPago: fromMercadoPago,
      externalRef,
      paymentId,
      status,
      preferenceId
    });

    // Se veio do Mercado Pago e tem payment_id, atualizar status
    if (fromMercadoPago && paymentId) {
      console.log('🎯 [SuccessPage] Came from Mercado Pago with payment_id, updating order...');
      updateOrderStatus();
    } else if (externalRef && paymentId) {
      // Caso normal (redirecionamento direto)
      console.log('🔄 [SuccessPage] Normal redirect with external_ref and payment_id');
      updateOrderStatus();
    } else if (externalRef) {
      // Apenas external_ref (pode ter vindo do botão "Voltar para o site")
      console.log('🔗 [SuccessPage] Only external_ref, checking order status...');
      checkOrderStatus();
    }

    // Auto-redirect se veio do Mercado Pago (backup)
    if (fromMercadoPago && !redirecting) {
      setRedirecting(true);
      console.log('⏰ [SuccessPage] Auto-redirecting from Mercado Pago in 3 seconds...');
      setTimeout(() => {
        if (externalRef) {
          const successUrl = `/checkout/success?external_ref=${externalRef}&payment_id=${paymentId || ''}&status=${status || 'approved'}`;
          console.log('🔄 [SuccessPage] Redirecting to:', successUrl);
          router.push(successUrl);
        }
      }, 3000);
    }
  }, [externalRef, paymentId, status, preferenceId]);

  const checkOrderStatus = async () => {
    if (!externalRef) return;
    
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
        console.error('❌ [SuccessPage] Erro ao buscar pedido:', fetchError);
        return;
      }

      if (order) {
        setOrderDetails(order);
        console.log('✅ [SuccessPage] Order found:', {
          id: order.id,
          status: order.status,
          external_reference: order.external_reference
        });
      }
    } catch (error) {
      console.error('❌ [SuccessPage] Erro ao verificar pedido:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!externalRef || !paymentId) return;
    
    setIsUpdating(true);
    try {
      const supabase = createClient();
      
      console.log('🔄 [SuccessPage] Updating order status:', {
        externalRef,
        paymentId,
        status: status || 'approved'
      });
      
      // Buscar o pedido pelo external_reference
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('external_reference', externalRef)
        .single();

      if (fetchError) {
        console.error('❌ [SuccessPage] Erro ao buscar pedido:', fetchError);
        return;
      }

      if (order) {
        setOrderDetails(order);
        
        // Atualizar status do pedido para 'paid' se ainda estiver pendente
        if (order.status === 'pending' || order.status === 'processing') {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_status: 'paid',
              payment_id: paymentId,
              updated_at: new Date().toISOString(),
            })
            .eq('external_reference', externalRef);

          if (updateError) {
            console.error('❌ [SuccessPage] Erro ao atualizar status do pedido:', updateError);
          } else {
            console.log('✅ [SuccessPage] Status do pedido atualizado para paid');
            setOrderDetails((prev: any) => ({ ...prev, status: 'paid', payment_status: 'paid' }));
          }
        } else {
          console.log('ℹ️ [SuccessPage] Order already has status:', order.status);
        }
      }
    } catch (error) {
      console.error('❌ [SuccessPage] Erro ao processar pedido:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Meta refresh para redirecionamento automático se vier do Mercado Pago */}
      {isFromMercadoPago && externalRef && (
        <Head>
          <meta httpEquiv="refresh" content={`3;url=/checkout/success?external_ref=${externalRef}&payment_id=${paymentId || ''}&status=${status || 'approved'}`} />
        </Head>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Pagamento Aprovado!</CardTitle>
                {isFromMercadoPago && (
                  <p className="text-sm text-muted-foreground">
                    Redirecionando para sua página de sucesso em 3 segundos...
                  </p>
                )}
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
                    Seu pedido foi recebido e está sendo processado. Você receberá um e-mail com os detalhes da sua compra.
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
                      <p className="text-sm">Status: <span className="font-medium text-green-600">{orderDetails.status === 'paid' ? 'Pago' : orderDetails.status}</span></p>
                      <p className="text-sm">Total: R$ {orderDetails.total?.toFixed(2)}</p>
                      <p className="text-sm">Data: {new Date(orderDetails.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </>
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
    </>
  );
}
