import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * 🔍 Endpoint para testar métodos de pagamento disponíveis
 * Especialmente útil para verificar se Pix e Nubank estão configurados corretamente
 */

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ MERCADO_PAGO_ACCESS_TOKEN not configured');
}

const client = accessToken ? new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
}) : null;

const preference = client ? new Preference(client) : null;

export async function GET() {
  try {
    if (!preference || !accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Mercado Pago not configured'
      }, { status: 503 });
    }

    console.log('🔍 Testing payment methods availability...');

    // Criar uma preferência de teste para verificar métodos disponíveis
    const testPreferenceData = {
      items: [{
        id: 'test',
        title: 'Teste - Métodos de Pagamento',
        category_id: 'test',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: 10.00
      }],
      payer: {
        name: 'Teste User',
        email: 'test@example.com',
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
        // Testar configuração explícita
        excluded_payment_methods: [],
        excluded_payment_types: [],
        included_payment_methods: [
          { id: 'pix' },          // Pix
          { id: 'nubank' },       // Nubank
          { id: 'visa' },         // Visa
          { id: 'master' },       // Mastercard
          { id: 'amex' },         // American Express
          { id: 'elo' },          // Elo
          { id: 'hipercard' }     // Hipercard
        ],
        installments: 12
      },
      external_reference: `TEST_${Date.now()}`,
      back_urls: {
        success: 'http://localhost:3000/success',
        failure: 'http://localhost:3000/failure',
        pending: 'http://localhost:3000/pending'
      }
    };

    const response = await preference.create({ body: testPreferenceData });

    console.log('✅ Test preference created successfully:', response.id);

    // Informações sobre a configuração atual
    const configInfo = {
      access_token_configured: !!accessToken,
      access_token_length: accessToken?.length || 0,
      access_token_prefix: accessToken?.substring(0, 20) + '...',
      is_production: !accessToken?.includes('TEST'),
      sdk_version: '2.7.0', // Versão do package.json
      environment: process.env.NODE_ENV
    };

    return NextResponse.json({
      success: true,
      message: 'Payment methods test completed successfully',
      test_preference: {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point
      },
      payment_methods_config: {
        excluded_payment_methods: testPreferenceData.payment_methods.excluded_payment_methods,
        excluded_payment_types: testPreferenceData.payment_methods.excluded_payment_types,
        included_payment_methods: testPreferenceData.payment_methods.included_payment_methods,
        installments: testPreferenceData.payment_methods.installments
      },
      configuration: configInfo,
      pix_status: '✅ Explicitamente incluído',
      nubank_status: '✅ Explicitamente incluído',
      recommendations: [
        '1. Pix deve aparecer como opção principal no checkout',
        '2. Nubank deve aparecer junto com outros cartões',
        '3. Se não aparecerem, pode ser limitação da conta de teste',
        '4. Em produção, todos os métodos devem estar disponíveis'
      ]
    });

  } catch (error) {
    console.error('❌ Error testing payment methods:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error testing payment methods',
      details: error instanceof Error ? error.message : 'Unknown error',
      recommendations: [
        'Verifique se MERCADO_PAGO_ACCESS_TOKEN está configurado',
        'Confirme se o token tem permissões adequadas',
        'Teste com uma conta de produção se necessário'
      ]
    }, { status: 500 });
  }
}
