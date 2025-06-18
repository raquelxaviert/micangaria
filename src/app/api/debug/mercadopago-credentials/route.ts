import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1462764550696594-061211-e1e1043f436264c9bf3ff42860b3a608-2490474713';
    
    console.log('🔍 Verificando credenciais do Mercado Pago...');
    console.log('Token de acesso:', accessToken.substring(0, 20) + '...');
    
    // Verificar se o token é de teste ou produção
    const isTestToken = accessToken.includes('TEST') || accessToken.includes('sandbox');
    const isProdToken = accessToken.includes('APP_USR');
    
    console.log('Tipo do token:', {
      isTestToken,
      isProdToken,
      tokenPreview: accessToken.substring(0, 20) + '...'
    });

    // Criar cliente do Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken: accessToken
    });

    // Tentar criar uma preferência de teste
    const preference = new Preference(client);
    const testPreferenceData = {
      body: {
        items: [
          {
            id: 'test_item',
            title: "Teste de Credenciais",
            unit_price: 10.00,
            quantity: 1,
            currency_id: "BRL"
          }
        ],
        external_reference: 'test_ref_' + Date.now(),
        back_urls: {
          success: 'https://www.rugebrecho.com/checkout/success',
          failure: 'https://www.rugebrecho.com/checkout/failure',
          pending: 'https://www.rugebrecho.com/checkout/pending'
        }
      }
    };

    console.log('Criando preferência de teste...');
    const result = await preference.create(testPreferenceData);
    
    console.log('Resultado da preferência de teste:', {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      has_sandbox: !!result.sandbox_init_point
    });

    return NextResponse.json({
      success: true,
      credentials: {
        accessToken: accessToken.substring(0, 20) + '...',
        isTestToken,
        isProdToken
      },
      testPreference: {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        has_sandbox: !!result.sandbox_init_point,
        should_use_sandbox: !!result.sandbox_init_point
      },
      recommendation: result.sandbox_init_point 
        ? 'Use sandbox_init_point para ambiente de teste' 
        : 'Token pode ser de produção ou sandbox não disponível'
    });

  } catch (error: any) {
    console.error('Erro ao verificar credenciais:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        message: error.message,
        status: error.status,
        cause: error.cause
      }
    }, { status: 500 });
  }
} 