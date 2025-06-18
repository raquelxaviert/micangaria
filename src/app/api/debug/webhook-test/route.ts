import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('�� [WebhookTest] Test webhook endpoint called');
    
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('📄 [WebhookTest] Request body:', body);
    console.log('📋 [WebhookTest] Request headers:', headers);
    
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
    
    // Simular headers do Mercado Pago
    const mockHeaders = {
      'x-signature': 'ts=1742505638683,v1=ced36ab6d33566bb1e16c125819b8d840d6b8ef136b0b9127c76064466f5229b',
      'x-request-id': 'test-request-id-123',
      'content-type': 'application/json'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Webhook test endpoint is working',
      received_body: body,
      received_headers: headers,
      mock_webhook_payload: mockWebhookPayload,
      mock_headers: mockHeaders,
      webhook_url: 'https://www.rugebrecho.com/api/webhooks/mercadopago',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [WebhookTest] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook Test Endpoint',
    usage: 'POST to test webhook functionality',
    webhook_url: 'https://www.rugebrecho.com/api/webhooks/mercadopago',
    timestamp: new Date().toISOString()
  });
} 