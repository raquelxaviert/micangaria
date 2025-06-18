import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [WebhookTest] Teste de webhook recebido!');
    
    // Log dos headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    console.log('📋 [WebhookTest] Headers recebidos:', headers);
    
    // Log do body
    const body = await request.text();
    console.log('📦 [WebhookTest] Body recebido:', body);
    
    // Tentar fazer parse do JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log('✅ [WebhookTest] Body parseado com sucesso:', parsedBody);
    } catch (parseError) {
      console.log('❌ [WebhookTest] Erro ao fazer parse do body:', parseError);
    }
    
    // Verificar se é uma notificação do Mercado Pago
    const isMercadoPagoWebhook = headers['x-signature'] || 
                                 headers['x-request-id'] || 
                                 (parsedBody && (parsedBody.type === 'payment' || parsedBody.action));
    
    console.log('🔍 [WebhookTest] É webhook do Mercado Pago?', isMercadoPagoWebhook);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook test received successfully',
      timestamp: new Date().toISOString(),
      headers: headers,
      body: parsedBody || body,
      isMercadoPagoWebhook: isMercadoPagoWebhook,
      webhookUrl: 'https://www.rugebrecho.com/api/webhooks/mercadopago'
    });
    
  } catch (error: any) {
    console.error('❌ [WebhookTest] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook Test Endpoint',
    usage: 'POST to test webhook reception',
    webhookUrl: 'https://www.rugebrecho.com/api/webhooks/mercadopago',
    testUrl: 'https://www.rugebrecho.com/api/debug/webhook-test',
    timestamp: new Date().toISOString()
  });
} 