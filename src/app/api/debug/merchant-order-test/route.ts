import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { merchantOrderService } from '@/lib/mercadopago/client';

// Função auxiliar para mapear status do Mercado Pago
function mapMercadoPagoStatusToYourStatus(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved': return 'paid';
    case 'pending': return 'pending';
    case 'in_process': return 'processing';
    case 'rejected': return 'payment_failed';
    case 'cancelled': return 'cancelled';
    case 'refunded': return 'refunded';
    default: return 'pending';
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [MerchantOrderTest] Testando processamento de merchant_order...');
    
    const body = await request.json();
    console.log('📄 [MerchantOrderTest] Payload recebido:', body);
    
    // Simular um webhook de merchant_order
    const mockWebhookPayload = {
      resource: "https://api.mercadolibre.com/merchant_orders/31817668412",
      topic: "merchant_order",
      type: "merchant_order"
    };
    
    // Usar o payload real se fornecido, senão usar o mock
    const payloadToProcess = body.payload || mockWebhookPayload;
    
    console.log('⚙️ [MerchantOrderTest] Processando payload:', payloadToProcess);
    
    const eventType = payloadToProcess.type || payloadToProcess.topic;
    let resourceId = payloadToProcess.data?.id || payloadToProcess.id || payloadToProcess.resource?.split('/').pop();
    
    console.log(`[MerchantOrderTest] Event type: ${eventType}, Resource ID: ${resourceId}`);
    
    if (eventType === 'merchant_order' && resourceId) {
      try {
        // Buscar detalhes do merchant order no Mercado Pago
        console.log(`[MerchantOrderTest] Buscando merchant order ID: ${resourceId}`);
        
        const merchantOrder = await merchantOrderService.get({ merchantOrderId: resourceId });
        console.log('[MerchantOrderTest] Detalhes do merchant order:', {
          id: merchantOrder.id,
          status: merchantOrder.status,
          preference_id: merchantOrder.preference_id,
          external_reference: merchantOrder.external_reference,
          payments_count: merchantOrder.payments?.length || 0
        });
        
        const preferenceId = merchantOrder.preference_id;
        const externalReference = merchantOrder.external_reference;
        const payments = merchantOrder.payments;
        
        if (payments && payments.length > 0) {
          // Pegar o pagamento mais relevante (aprovado primeiro, depois mais recente)
          const payment = payments.find(p => p.status === 'approved') || payments[payments.length - 1];
          
          if (payment && payment.status && payment.id) {
            const paymentId = payment.id;
            const paymentStatus = payment.status;
            const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);
            
            console.log(`[MerchantOrderTest] Processando pagamento - ID: ${paymentId}, Status: ${paymentStatus} -> ${mappedOrderStatus}`);
            
            // Tentar atualizar por external_reference primeiro, depois por preference_id
            let updateSuccess = false;
            
            if (externalReference) {
              console.log(`[MerchantOrderTest] Atualizando pedido por external_reference: ${externalReference}`);
              const supabase = await createClient();
              const { data, error } = await supabase
                .from('orders')
                .update({
                  status: mappedOrderStatus,
                  payment_id: paymentId.toString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('external_reference', externalReference);
              
              if (!error) {
                console.log('[MerchantOrderTest] ✅ Pedido atualizado com sucesso por external_reference!');
                return NextResponse.json({
                  success: true,
                  message: 'Merchant order processado com sucesso',
                  merchant_order_id: resourceId,
                  payment_id: paymentId,
                  external_reference: externalReference,
                  status: mappedOrderStatus,
                  method: 'external_reference',
                  updated_order: data
                });
              } else {
                console.log('[MerchantOrderTest] Falha ao atualizar por external_reference, tentando preference_id...', error.message);
              }
            }
            
            if (!updateSuccess && preferenceId) {
              console.log(`[MerchantOrderTest] Atualizando pedido por preference_id: ${preferenceId}`);
              const supabase = await createClient();
              const { data, error } = await supabase
                .from('orders')
                .update({
                  status: mappedOrderStatus,
                  payment_id: paymentId.toString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('preference_id', preferenceId);
              
              if (!error) {
                console.log('[MerchantOrderTest] ✅ Pedido atualizado com sucesso por preference_id!');
                return NextResponse.json({
                  success: true,
                  message: 'Merchant order processado com sucesso',
                  merchant_order_id: resourceId,
                  payment_id: paymentId,
                  preference_id: preferenceId,
                  status: mappedOrderStatus,
                  method: 'preference_id',
                  updated_order: data
                });
              } else {
                console.error('[MerchantOrderTest] Erro ao atualizar por preference_id:', error);
              }
            }
            
            if (!updateSuccess) {
              console.error('[MerchantOrderTest] Falha ao atualizar pedido - nenhuma referência válida encontrada');
              return NextResponse.json({
                success: false,
                error: 'Falha ao atualizar pedido',
                external_reference: externalReference,
                preference_id: preferenceId
              }, { status: 400 });
            }
            
          } else {
            console.warn('[MerchantOrderTest] Nenhum pagamento adequado encontrado no merchant_order');
            return NextResponse.json({
              success: false,
              error: 'Nenhum pagamento adequado encontrado',
              payments: payments
            }, { status: 400 });
          }
        } else {
          console.warn('[MerchantOrderTest] Nenhum pagamento encontrado no merchant_order');
          return NextResponse.json({
            success: false,
            error: 'Nenhum pagamento encontrado',
            merchant_order_status: merchantOrder.status
          }, { status: 400 });
        }
        
      } catch (mpError: any) {
        console.error('[MerchantOrderTest] Erro ao buscar merchant order no MP:', mpError.message);
        return NextResponse.json({
          success: false,
          error: 'Erro ao buscar merchant order',
          mp_error: mpError.message
        }, { status: 500 });
      }
    } else {
      console.log('[MerchantOrderTest] Evento não suportado ou ID não encontrado');
      return NextResponse.json({
        success: false,
        error: 'Evento não suportado',
        event_type: eventType,
        resource_id: resourceId
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('[MerchantOrderTest] Erro geral:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Merchant Order Test Endpoint',
    usage: 'POST com payload do webhook merchant_order para testar processamento',
    example: {
      payload: {
        resource: "https://api.mercadolibre.com/merchant_orders/31817668412",
        topic: "merchant_order",
        type: "merchant_order"
      }
    },
    timestamp: new Date().toISOString()
  });
} 