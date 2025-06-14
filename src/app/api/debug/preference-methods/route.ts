import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * 🔍 Debug: Verificar quais métodos de pagamento estão realmente disponíveis em uma preferência
 */

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ MERCADO_PAGO_ACCESS_TOKEN not configured');
}

const client = accessToken ? new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'debug-preference'
  }
}) : null;

const preference = client ? new Preference(client) : null;

export async function GET() {
  try {
    if (!preference) {
      return NextResponse.json(
        { success: false, error: 'Mercado Pago not configured' },
        { status: 503 }
      );
    }

    // Criar uma preferência de teste simples
    const testPreference = {
      items: [
        {
          id: 'test-debug',
          title: 'Produto Teste para Debug',
          category_id: 'fashion',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 50.00
        }
      ],
      payer: {
        name: 'Usuario Teste',
        email: 'test@exemplo.com',
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
      external_reference: `DEBUG${Date.now()}`,
      notification_url: 'https://www.rugebrecho.com/api/webhooks/mercadopago'
    };

    console.log('🔍 Criando preferência de debug...');
    const response = await preference.create({ body: testPreference });
    
    console.log('✅ Preferência criada:', response.id);    // Agora vamos buscar detalhes da preferência para ver os métodos disponíveis
    let preferenceDetails = null;
    try {
      if (response.id) {
        preferenceDetails = await preference.get({ preferenceId: response.id });
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível buscar detalhes da preferência:', e);
    }
    
    return NextResponse.json({
      success: true,
      preference_id: response.id,
      sandbox_init_point: response.sandbox_init_point,
      init_point: response.init_point,
      payment_methods_config: testPreference.payment_methods,
      preference_details: preferenceDetails,
      debug_info: {
        configured_exclusions: {
          excluded_methods: testPreference.payment_methods.excluded_payment_methods,
          excluded_types: testPreference.payment_methods.excluded_payment_types
        },
        test_links: {
          sandbox_checkout: response.sandbox_init_point,
          production_checkout: response.init_point
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência de debug:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao debugar preferência',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        debug: error && typeof error === 'object' ? {
          message: (error as any).message,
          status: (error as any).status,
          error: (error as any).error
        } : null
      },
      { status: 500 }
    );
  }
}
