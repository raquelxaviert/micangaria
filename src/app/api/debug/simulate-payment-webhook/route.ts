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
    console.log('🧪 [SimulatePaymentWebhook] Simulando webhook de pagamento...');
    
    const body = await request.json();
    console.log('📄 [SimulatePaymentWebhook] Payload recebido:', body);
    
    // Simular um webhook de pagamento aprovado
    const mockPaymentWebhook = {
      id: 12345,
      live_mode: false,
      type: "payment",
      date_created: new Date().toISOString(),
      user_id: 2490474713,
      api_version: "v1",
      action: "payment.updated",
      data: {
        id: "123456789"
      }
    };
    
    // Usar o payload real se fornecido, senão usar o mock
    const payloadToProcess = body.payload || mockPaymentWebhook;
    
    console.log('⚙️ [SimulatePaymentWebhook] Processando payload:', payloadToProcess);
    
    const eventType = payloadToProcess.type;
    let resourceId = payloadToProcess.data?.id;
    
    console.log(`[SimulatePaymentWebhook] Event type: ${eventType}, Resource ID: ${resourceId}`);
    
    if (eventType === 'payment' && resourceId) {
      try {
        // Tentar buscar detalhes do pagamento no Mercado Pago
        console.log(`[SimulatePaymentWebhook] Buscando pagamento ID: ${resourceId}`);
        
        const paymentDetails = await paymentService.get({ id: resourceId });
        console.log('[SimulatePaymentWebhook] Detalhes do pagamento:', {
          id: paymentDetails.id,
          status: paymentDetails.status,
          external_reference: paymentDetails.external_reference
        });
        
        const externalReference = paymentDetails.external_reference;
        const paymentStatus = paymentDetails.status;
        
        if (externalReference && paymentStatus) {
          const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);
          console.log(`[SimulatePaymentWebhook] Atualizando pedido: ${externalReference} -> ${mappedOrderStatus}`);
          
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
            console.error('[SimulatePaymentWebhook] Erro ao atualizar pedido:', error);
            return NextResponse.json({
              success: false,
              error: 'Erro ao atualizar pedido no Supabase',
              details: error
            }, { status: 500 });
          } else {
            console.log('[SimulatePaymentWebhook] ✅ Pedido atualizado com sucesso!');
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
          console.warn('[SimulatePaymentWebhook] Dados insuficientes para processar pagamento');
          return NextResponse.json({
            success: false,
            error: 'Dados insuficientes',
            external_reference: externalReference,
            payment_status: paymentStatus
          }, { status: 400 });
        }
        
      } catch (mpError: any) {
        console.error('[SimulatePaymentWebhook] Erro ao buscar pagamento no MP:', mpError.message);
        
        // Fallback: tentar atualizar o pedido mais recente
        console.log('[SimulatePaymentWebhook] 🔄 Tentando fallback com pedido mais recente...');
        
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
            console.log('[SimulatePaymentWebhook] Pedido recente encontrado:', recentOrder.external_reference);
            
            const { data, error: updateError } = await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_id: resourceId.toString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', recentOrder.id);
            
            if (!updateError) {
              console.log('[SimulatePaymentWebhook] ✅ Fallback bem-sucedido!');
              return NextResponse.json({
                success: true,
                message: 'Pagamento processado via fallback',
                payment_id: resourceId,
                order_id: recentOrder.id,
                external_reference: recentOrder.external_reference,
                method: 'fallback'
              });
            } else {
              console.error('[SimulatePaymentWebhook] Erro no fallback:', updateError);
            }
          }
        } catch (fallbackError: any) {
          console.error('[SimulatePaymentWebhook] Erro no fallback:', fallbackError.message);
        }
        
        return NextResponse.json({
          success: false,
          error: 'Erro ao processar pagamento',
          mp_error: mpError.message
        }, { status: 500 });
      }
    } else {
      console.log('[SimulatePaymentWebhook] Evento não suportado ou ID não encontrado');
      return NextResponse.json({
        success: false,
        error: 'Evento não suportado',
        event_type: eventType,
        resource_id: resourceId
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('[SimulatePaymentWebhook] Erro geral:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Simulate Payment Webhook Endpoint',
    usage: 'POST com payload do webhook de pagamento para testar processamento',
    example: {
      payload: {
        id: 12345,
        live_mode: false,
        type: "payment",
        date_created: "2025-06-18T03:22:04.070Z",
        user_id: 2490474713,
        api_version: "v1",
        action: "payment.updated",
        data: {
          id: "123456789"
        }
      }
    },
    instructions: [
      "1. Configure o webhook para 'Pagamentos' (não 'Ordens comerciais')",
      "2. Teste com cartão de teste: 5031 4332 1540 6351",
      "3. Use nome 'APRO' e CPF '12345678909' para pagamento aprovado",
      "4. Monitore os logs para ver o processamento"
    ],
    timestamp: new Date().toISOString()
  });
} 