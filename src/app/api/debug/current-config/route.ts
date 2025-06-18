import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const currentConfig = {
    title: "Configuração Atual do Sistema",
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
      isSandbox: process.env.MERCADO_PAGO_SANDBOX === 'true',
      isProduction: process.env.MERCADO_PAGO_SANDBOX === 'false'
    },
    
    mercadopago: {
      hasAccessToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      accessTokenType: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('APP_USR_') ? 'PRODUCTION' : 
                      process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-') ? 'SANDBOX' : 'UNKNOWN',
      hasWebhookSecret: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
      webhookSecretLength: process.env.MERCADOPAGO_WEBHOOK_SECRET?.length || 0
    },
    
    checkout_behavior: {
      description: "Comportamento atual do checkout",
      mode: process.env.MERCADO_PAGO_SANDBOX === 'true' ? 'SANDBOX' : 'PRODUCTION',
      url_used: process.env.MERCADO_PAGO_SANDBOX === 'true' ? 'sandbox_init_point' : 'init_point',
      api_endpoint: process.env.MERCADO_PAGO_SANDBOX === 'true' ? 'sandbox.mercadopago.com' : 'api.mercadopago.com'
    },
    
    recommendations: {
      for_production: [
        "1. Definir MERCADO_PAGO_SANDBOX=false no Vercel",
        "2. Configurar webhook para 'Pagamentos' no Mercado Pago",
        "3. Usar credenciais de produção da conta de teste",
        "4. Testar com cartões de teste da documentação"
      ],
      for_sandbox: [
        "1. Definir MERCADO_PAGO_SANDBOX=true no Vercel",
        "2. Configurar webhook para 'Pagamentos' no Mercado Pago",
        "3. Usar credenciais de produção da conta de teste",
        "4. Testar com cartões de teste da documentação"
      ]
    },
    
    webhook_configuration: {
      url: "https://www.rugebrecho.com/api/webhooks/mercadopago",
      required_events: ["Pagamentos"],
      current_issue: "Configurado para 'Ordens comerciais' em vez de 'Pagamentos'",
      fix: "Reconfigurar webhook no Mercado Pago para receber apenas eventos de 'Pagamentos'"
    },
    
    testing: {
      cartoes_teste: {
        mastercard: "5031 4332 1540 6351",
        visa: "4235 6477 2802 5682",
        amex: "3753 651535 56885"
      },
      dados_aprovacao: {
        nome: "APRO",
        cpf: "12345678909"
      },
      dados_rejeicao: {
        nome: "OTHE",
        cpf: "12345678909"
      }
    },
    
    debug_routes: {
      current_config: "https://www.rugebrecho.com/api/debug/current-config",
      webhook_config: "https://www.rugebrecho.com/api/debug/webhook-config",
      sandbox_status: "https://www.rugebrecho.com/api/debug/sandbox-status",
      simulate_payment: "https://www.rugebrecho.com/api/debug/simulate-payment-webhook"
    },
    
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(currentConfig);
} 