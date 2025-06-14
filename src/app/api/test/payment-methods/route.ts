import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig } from 'mercadopago';

/**
 * 🧪 TESTE ESPECÍFICO - Métodos de Pagamento
 * 
 * Endpoint para testar se Pix e Nubank estão disponíveis
 */

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  console.log('🔍 [TestPaymentMethods] Testing payment methods availability...');
  
  try {
    if (!accessToken) {
      return NextResponse.json({
        error: 'MERCADO_PAGO_ACCESS_TOKEN not configured',
        available: false
      }, { status: 500 });
    }

    // Configurar cliente do Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000
      }
    });

    // Testar criação de preferência simples
    const testPreference = {
      items: [
        {
          id: 'test-item',
          title: 'Produto Teste',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 10.00
        }
      ],
      payer: {
        email: 'test@teste.com'
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      external_reference: `TEST${Date.now()}`
    };

    console.log('🧪 [TestPaymentMethods] Creating test preference...');
    
    // Usar fetch direto para testar
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPreference)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ [TestPaymentMethods] Error creating preference:', data);
      return NextResponse.json({
        error: 'Failed to create test preference',
        details: data,
        status: response.status
      }, { status: 500 });
    }

    console.log('✅ [TestPaymentMethods] Test preference created:', data.id);

    // Agora vamos verificar os métodos de pagamento disponíveis
    const paymentMethodsResponse = await fetch(`https://api.mercadopago.com/v1/payment_methods?public_key=${process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY}`);
    const paymentMethods = await paymentMethodsResponse.json();

    const pixAvailable = paymentMethods.some((method: any) => method.id === 'pix');
    const nubankAvailable = paymentMethods.some((method: any) => method.id === 'nubank');

    return NextResponse.json({
      success: true,
      test_preference: {
        id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point
      },
      payment_methods_analysis: {
        total_methods: paymentMethods.length,
        pix_available: pixAvailable,
        nubank_available: nubankAvailable,
        credit_cards: paymentMethods.filter((m: any) => m.payment_type_id === 'credit_card').length,
        debit_cards: paymentMethods.filter((m: any) => m.payment_type_id === 'debit_card').length,
        digital_wallets: paymentMethods.filter((m: any) => m.payment_type_id === 'digital_wallet').length
      },
      available_methods: paymentMethods.map((method: any) => ({
        id: method.id,
        name: method.name,
        payment_type_id: method.payment_type_id,
        status: method.status
      })),
      environment: {
        sandbox: process.env.MERCADO_PAGO_SANDBOX === 'true',
        node_env: process.env.NODE_ENV,
        has_access_token: !!accessToken,
        has_public_key: !!process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
      }
    });

  } catch (error: any) {
    console.error('❌ [TestPaymentMethods] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
