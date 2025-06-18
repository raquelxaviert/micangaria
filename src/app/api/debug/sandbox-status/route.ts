import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [SandboxStatus] Testando status do sandbox...');
    
    // Configurar cliente do Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1462764550696594-061211-e1e1043f436264c9bf3ff42860b3a608-2490474713';
    const client = new MercadoPagoConfig({ 
      accessToken: accessToken
    });

    // Determinar modo atual
    const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true';
    
    console.log('🔧 [SandboxStatus] Configuração atual:', {
      NODE_ENV: process.env.NODE_ENV,
      MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
      isSandbox,
      accessTokenType: accessToken.startsWith('APP_USR_') ? 'PRODUCTION' : 'SANDBOX'
    });

    // Criar preferência de teste
    const preference = new Preference(client);
    const testPreferenceData = {
      body: {
        items: [
          {
            id: 'test_sandbox',
            title: "Teste Sandbox Status",
            unit_price: 10.00,
            quantity: 1,
            currency_id: "BRL"
          }
        ],
        external_reference: 'test_sandbox_' + Date.now(),
        back_urls: {
          success: 'https://www.rugebrecho.com/checkout/success',
          failure: 'https://www.rugebrecho.com/checkout/failure',
          pending: 'https://www.rugebrecho.com/checkout/pending'
        }
      }
    };

    console.log('🧪 [SandboxStatus] Criando preferência de teste...');
    const result = await preference.create(testPreferenceData);
    
    console.log('✅ [SandboxStatus] Preferência criada:', {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      has_sandbox: !!result.sandbox_init_point
    });

    // Testar URLs
    const testUrls = {
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      should_use: isSandbox ? result.sandbox_init_point : result.init_point
    };

    // Testar se as URLs são acessíveis
    const urlTests: Record<string, any> = {};
    
    for (const [name, url] of Object.entries(testUrls)) {
      if (url) {
        try {
          console.log(`🔍 [SandboxStatus] Testando URL ${name}: ${url}`);
          const response = await fetch(url, { method: 'HEAD' });
          urlTests[name] = {
            status: response.status,
            ok: response.ok,
            url: url
          };
        } catch (error: any) {
          urlTests[name] = {
            error: error.message,
            url: url
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      configuration: {
        NODE_ENV: process.env.NODE_ENV,
        MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
        isSandbox,
        accessTokenType: accessToken.startsWith('APP_USR_') ? 'PRODUCTION' : 'SANDBOX'
      },
      preference: {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        has_sandbox: !!result.sandbox_init_point
      },
      urlTests,
      recommendation: {
        should_use_sandbox: isSandbox,
        recommended_url: isSandbox ? result.sandbox_init_point : result.init_point,
        reason: isSandbox 
          ? 'MERCADO_PAGO_SANDBOX=true' 
          : 'MERCADO_PAGO_SANDBOX=false'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [SandboxStatus] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        message: error.message,
        status: error.status,
        cause: error.cause
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 