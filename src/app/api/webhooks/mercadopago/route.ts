import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔧 WEBHOOK SIMPLIFICADO PARA DEBUG
 * 
 * Este webhook aceita QUALQUER evento do Mercado Pago
 * e sempre retorna 200 para evitar erro 502
 */

export async function POST(request: NextRequest) {
  let body: any = null;
  
  try {
    // Tentar ler o corpo da requisição
    body = await request.json();
    
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

    // Responder OK para QUALQUER evento
    return NextResponse.json({ 
      received: true, 
      message: `Evento ${body.type} recebido com sucesso`,
      timestamp: new Date().toISOString(),
      event_id: body.id
    });

  } catch (error) {
    // Log de erro detalhado
    console.error('❌ [WEBHOOK] Erro ao processar webhook:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
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