import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Simular uma resposta de sucesso do Mercado Pago
    const mockResponse = {
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test_preference_123',
      sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=test_preference_123',
      preference_id: 'test_preference_123',
      note: 'This is a test response to verify the frontend flow'
    };

    console.log('🧪 Test payment API called with data:', data);
    console.log('🧪 Returning mock response:', mockResponse);

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('🧪 Test payment API error:', error);
    return NextResponse.json({
      error: 'Test payment API error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 