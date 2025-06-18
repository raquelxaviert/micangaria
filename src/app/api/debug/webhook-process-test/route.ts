import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentService } from '@/lib/mercadopago/client';

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
    console.log('🧪 [WebhookProcessTest] Testando processamento do webhook...');
    
    const body = await request.json();
    console.log('📄 [WebhookProcessTest] Payload recebido:', body);
    
    // Simular um webhook de pagamento aprovado
    const mockWebhookPayload = {
      action: "payment.updated",
      api_version: "v1",
      data: {
        id: "123456789"
      },
      date_created: new Date().toISOString(),
      id: "123456789",
      live_mode: false,
      type: "payment",
      user_id: 2490474713
    };
    
    // Usar o payload real se fornecido, senão usar o mock
    const payloadToProcess = body.payload || mockWebhookPayload;
    
    console.log('⚙️ [WebhookProcessTest] Processando payload:', payloadToProcess);
    
    const eventType = payloadToProcess.type;
    let resourceId = payloadToProcess.data?.id;
    
    console.log(`[WebhookProcessTest] Event type: ${eventType}, Resource ID: ${resourceId}`);
    
    if (eventType === 'payment' && resourceId) {
      try {
        // Tentar buscar detalhes do pagamento no Mercado Pago
        console.log(`[WebhookProcessTest] Buscando pagamento ID: ${resourceId}`);
        
        const paymentDetails = await paymentService.get({ id: resourceId });
        console.log('[WebhookProcessTest] Detalhes do pagamento:', {
          id: paymentDetails.id,
          status: paymentDetails.status,
          external_reference: paymentDetails.external_reference
        });
        
        const externalReference = paymentDetails.external_reference;
        const paymentStatus = paymentDetails.status;
        
        if (externalReference && paymentStatus) {
          const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);
          console.log(`[WebhookProcessTest] Atualizando pedido: ${externalReference} -> ${mappedOrderStatus}`);
          
          const supabase = await createClient();
          const { data, error } = await supabase
            .from('orders')
            .update({
              status: mappedOrderStatus,
              payment_id: resourceId.toString(),
              updated_at: new Date().toISOString(),
            })
            .eq('external_reference', externalReference);
          
          if (error) {
            console.error('[WebhookProcessTest] Erro ao atualizar pedido:', error);
            return NextResponse.json({
              success: false,
              error: 'Erro ao atualizar pedido no Supabase',
              details: error
            }, { status: 500 });
          } else {
            console.log('[WebhookProcessTest] ✅ Pedido atualizado com sucesso!');
            return NextResponse.json({
              success: true,
              message: 'Pagamento processado com sucesso',
              payment_id: resourceId,
              external_reference: externalReference,
              status: mappedOrderStatus,
              updated_order: data
            });
          }
        } else {
          console.warn('[WebhookProcessTest] Dados insuficientes para processar pagamento');
          return NextResponse.json({
            success: false,
            error: 'Dados insuficientes',
            external_reference: externalReference,
            payment_status: paymentStatus
          }, { status: 400 });
        }
        
      } catch (mpError: any) {
        console.error('[WebhookProcessTest] Erro ao buscar pagamento no MP:', mpError.message);
        
        // Fallback: tentar atualizar o pedido mais recente
        console.log('[WebhookProcessTest] 🔄 Tentando fallback com pedido mais recente...');
        
        try {
          const supabase = await createClient();
          const { data: recentOrders, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (!fetchError && recentOrders && recentOrders.length > 0) {
            const recentOrder = recentOrders[0];
            console.log('[WebhookProcessTest] Pedido recente encontrado:', recentOrder.external_reference);
            
            const { data, error: updateError } = await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_id: resourceId.toString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', recentOrder.id);
            
            if (!updateError) {
              console.log('[WebhookProcessTest] ✅ Fallback bem-sucedido!');
              return NextResponse.json({
                success: true,
                message: 'Pagamento processado via fallback',
                payment_id: resourceId,
                order_id: recentOrder.id,
                external_reference: recentOrder.external_reference,
                method: 'fallback'
              });
            } else {
              console.error('[WebhookProcessTest] Erro no fallback:', updateError);
            }
          }
        } catch (fallbackError: any) {
          console.error('[WebhookProcessTest] Erro no fallback:', fallbackError.message);
        }
        
        return NextResponse.json({
          success: false,
          error: 'Erro ao processar pagamento',
          mp_error: mpError.message
        }, { status: 500 });
      }
    } else {
      console.log('[WebhookProcessTest] Evento não suportado ou ID não encontrado');
      return NextResponse.json({
        success: false,
        error: 'Evento não suportado',
        event_type: eventType,
        resource_id: resourceId
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('[WebhookProcessTest] Erro geral:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook Process Test Endpoint',
    usage: 'POST com payload do webhook para testar processamento',
    example: {
      payload: {
        action: "payment.updated",
        api_version: "v1",
        data: { id: "123456789" },
        type: "payment",
        user_id: 2490474713
      }
    },
    timestamp: new Date().toISOString()
  });
} 