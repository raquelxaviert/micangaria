import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase client para operações no webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 🔧 WEBHOOK MERCADO PAGO ULTRA SIMPLIFICADO
 * 
 * - Aceita todos os eventos do Mercado Pago
 * - Processa eventos de payment para atualizar status no Supabase
 * - SEMPRE retorna 200 para evitar erro 502
 * - Máxima tolerância a erros
 */

/**
 * Processa eventos de pagamento
 */
async function processPaymentEvent(paymentId: string, eventAction: string) {
  try {
    console.log(`💳 [WEBHOOK] Processando evento de pagamento: ${paymentId} (${eventAction})`);
    
    // Buscar informações do pagamento via API do MP
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar pagamento: ${response.status} ${response.statusText}`);
    }

    const payment = await response.json();
    
    console.log('💰 [WEBHOOK] Dados do pagamento obtidos:', {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
      date_created: payment.date_created,
      date_approved: payment.date_approved
    });

    // Se há external_reference, tentar atualizar o pedido no Supabase
    if (payment.external_reference) {
      const orderUpdate: any = {
        payment_id: payment.id,
        payment_status: payment.status,
        payment_status_detail: payment.status_detail,
        updated_at: new Date().toISOString()
      };

      // Se pagamento foi aprovado, marcar como pago
      if (payment.status === 'approved') {
        orderUpdate.status = 'paid';
        orderUpdate.paid_at = payment.date_approved || new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(orderUpdate)
        .eq('id', payment.external_reference)
        .select();

      if (error) {
        console.error('❌ [WEBHOOK] Erro ao atualizar pedido no Supabase:', error);
      } else {
        console.log('✅ [WEBHOOK] Pedido atualizado no Supabase:', data);
      }
    } else {
      console.log('⚠️ [WEBHOOK] Pagamento sem external_reference, não foi possível atualizar pedido');
    }

  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao processar evento de pagamento:', error);
  }
}

export async function POST(request: NextRequest) {
  let body: any = null;
  let rawBody = '';
  
  try {
    // Tentar ler o corpo da requisição como texto
    try {
      rawBody = await request.text();
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ [WEBHOOK] Erro ao parsear corpo da requisição:', parseError);
      // Mesmo com erro de parse, retornar 200
      return NextResponse.json({ 
        received: true, 
        error: 'Erro no parse do JSON',
        timestamp: new Date().toISOString()
      });
    }
    
    // Log detalhado de QUALQUER evento recebido
    console.log('🔔 [WEBHOOK] Evento recebido do Mercado Pago:', {
      timestamp: new Date().toISOString(),
      type: body.type,
      action: body.action,
      id: body.id,
      data: body.data,
      live_mode: body.live_mode,
      user_id: body.user_id,
      full_body: body
    });

    // Processar eventos específicos com try/catch individual
    if (body.type === 'payment') {
      try {
        await processPaymentEvent(body.data?.id || body.id, body.action);
      } catch (paymentError) {
        console.error('❌ [WEBHOOK] Erro ao processar evento de pagamento:', paymentError);
        // Não falhar o webhook por causa de erro de processamento
      }
    } else {
      console.log(`ℹ️ [WEBHOOK] Evento ${body.type} recebido mas não processado automaticamente`);
    }

    // SEMPRE responder OK para QUALQUER evento
    return NextResponse.json({ 
      received: true, 
      message: `Evento ${body.type || 'desconhecido'} recebido com sucesso`,
      timestamp: new Date().toISOString(),
      event_id: body.id || 'unknown',
      processed: body.type === 'payment'
    });

  } catch (error) {
    // Log de erro detalhado
    console.error('❌ [WEBHOOK] Erro geral ao processar webhook:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      rawBody: rawBody?.substring(0, 200) + '...',
      body_received: body
    });
    
    // SEMPRE retornar 200 para evitar reenvios do MP
    return NextResponse.json({ 
      received: true, 
      error: 'Erro processado internamente',
      timestamp: new Date().toISOString()
    });
  }
}

// Método GET para testar se a URL está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook Mercado Pago Online',
    timestamp: new Date().toISOString(),
    message: 'Endpoint funcionando corretamente'
  });
}