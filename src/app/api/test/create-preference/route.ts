import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * 🧪 TESTE DIRETO - Criação de Preferência
 * 
 * Endpoint para testar criação de preferência com Pix e Nubank
 */

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  console.log('🧪 [TestDirectPreference] Creating test preference...');
  
  try {
    if (!accessToken) {
      return NextResponse.json({
        error: 'MERCADO_PAGO_ACCESS_TOKEN not configured',
        success: false
      }, { status: 500 });
    }

    // Configurar cliente do Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000
      }
    });

    const preference = new Preference(client);

    // Criar preferência de teste simples
    const testPreference = {
      items: [
        {
          id: 'test-produto',
          title: 'Produto de Teste',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 10.00,
          category_id: 'fashion'
        }
      ],
      payer: {
        name: 'João da Silva',
        email: 'joao.teste@email.com',
        phone: {
          area_code: '11',
          number: '999999999'
        },
        identification: {
          type: 'CPF',
          number: '12345678909'
        }
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      back_urls: {
        success: 'http://localhost:9002/checkout/success',
        failure: 'http://localhost:9002/checkout/failure',
        pending: 'http://localhost:9002/checkout/pending'
      },
      auto_return: 'approved',
      external_reference: `TESTE${Date.now()}`,
      notification_url: 'http://localhost:9002/api/webhooks/mercadopago'
    };

    console.log('🔧 [TestDirectPreference] Preference data:', JSON.stringify(testPreference, null, 2));

    const response = await preference.create({ body: testPreference });
    
    console.log('✅ [TestDirectPreference] Preference created successfully:', response.id);

    return NextResponse.json({
      success: true,
      preference: {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        client_id: response.client_id,
        collector_id: response.collector_id,
        operation_type: response.operation_type
      },
      test_urls: {
        checkout: response.sandbox_init_point || response.init_point,
        success: testPreference.back_urls.success,
        webhook: testPreference.notification_url
      },
      environment: {
        sandbox: process.env.MERCADO_PAGO_SANDBOX === 'true',
        access_token_preview: accessToken?.substring(0, 20) + '...',
        public_key_preview: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.substring(0, 20) + '...'
      }
    });

  } catch (error: any) {
    console.error('❌ [TestDirectPreference] Error:', error);
    return NextResponse.json({
      error: 'Failed to create test preference',
      message: error.message,
      details: error.response?.data || error.stack,
      success: false
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Send a POST request to create a test preference',
    instructions: 'Use POST method to test preference creation'
  });
}
