import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 [WebhookConfig] Verificando configuração do webhook...');
    
    // Configuração atual
    const currentConfig = {
      webhookUrl: 'https://www.rugebrecho.com/api/webhooks/mercadopago',
      testUrl: 'https://www.rugebrecho.com/api/debug/webhook-test',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
      },
      credentials: {
        hasAccessToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
        hasWebhookSecret: !!process.env.MERCADO_PAGO_WEBHOOK_SECRET,
        accessTokenType: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('APP_USR_') ? 'PRODUCTION' : 'SANDBOX'
      }
    };
    
    console.log('📋 [WebhookConfig] Configuração atual:', currentConfig);
    
    // Verificar se a URL do webhook está acessível
    let webhookAccessibility = 'unknown';
    try {
      const response = await fetch(currentConfig.webhookUrl, { method: 'HEAD' });
      webhookAccessibility = response.ok ? 'accessible' : `error_${response.status}`;
    } catch (error: any) {
      webhookAccessibility = `error_${error.message}`;
    }
    
    // Recomendações baseadas na configuração
    const recommendations = [];
    
    if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
      recommendations.push('❌ MERCADO_PAGO_WEBHOOK_SECRET não configurado');
    }
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      recommendations.push('❌ MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }
    
    if (webhookAccessibility !== 'accessible') {
      recommendations.push(`❌ Webhook URL não está acessível: ${webhookAccessibility}`);
    }
    
    if (process.env.MERCADO_PAGO_SANDBOX === 'true') {
      recommendations.push('ℹ️ Modo SANDBOX ativo - usando sandbox_init_point');
    } else {
      recommendations.push('ℹ️ Modo PRODUÇÃO ativo - usando init_point');
    }
    
    // Instruções para configurar webhook no Mercado Pago
    const setupInstructions = {
      step1: 'Acesse Mercado Pago Developers > Suas integrações',
      step2: 'Selecione sua aplicação',
      step3: 'Vá em Webhooks > Configurar notificações',
      step4: 'Configure a URL: https://www.rugebrecho.com/api/webhooks/mercadopago',
      step5: 'Selecione o evento "Pagamentos"',
      step6: 'Salve a configuração',
      step7: 'Copie a chave secreta gerada e configure MERCADO_PAGO_WEBHOOK_SECRET'
    };
    
    return NextResponse.json({
      success: true,
      configuration: currentConfig,
      webhookAccessibility,
      recommendations,
      setupInstructions,
      troubleshooting: {
        webhookNotReceived: [
          '1. Verificar se a URL está configurada corretamente no Mercado Pago',
          '2. Verificar se o evento "Pagamentos" está selecionado',
          '3. Verificar se a chave secreta está configurada',
          '4. Testar com a rota de debug: /api/debug/webhook-test',
          '5. Verificar logs do servidor para erros'
        ],
        sandboxIssues: [
          '1. Mesmo em sandbox, usar credenciais de PRODUÇÃO da conta de teste',
          '2. Usar sandbox_init_point quando MERCADO_PAGO_SANDBOX=true',
          '3. Webhook deve ser configurado na mesma aplicação'
        ]
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [WebhookConfig] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 