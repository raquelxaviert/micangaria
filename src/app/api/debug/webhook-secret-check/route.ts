import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const webhookSecretAlt = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  
  const check = {
    title: "Verificação da Chave Secreta do Webhook",
    status: {
      MERCADO_PAGO_WEBHOOK_SECRET: {
        configured: !!webhookSecret,
        length: webhookSecret?.length || 0,
        preview: webhookSecret ? `${webhookSecret.substring(0, 10)}...` : 'NOT_SET'
      },
      MERCADOPAGO_WEBHOOK_SECRET: {
        configured: !!webhookSecretAlt,
        length: webhookSecretAlt?.length || 0,
        preview: webhookSecretAlt ? `${webhookSecretAlt.substring(0, 10)}...` : 'NOT_SET'
      }
    },
    
    recommendation: {
      action: webhookSecret || webhookSecretAlt ? '✅ Chave secreta configurada' : '❌ Chave secreta não configurada',
      next_steps: webhookSecret || webhookSecretAlt ? [
        '1. Verificar se o webhook está configurado no Mercado Pago',
        '2. Testar com cartão de teste',
        '3. Verificar logs do servidor'
      ] : [
        '1. Configurar webhook no Mercado Pago Developers',
        '2. Copiar a chave secreta gerada',
        '3. Adicionar como MERCADO_PAGO_WEBHOOK_SECRET no Vercel',
        '4. Fazer redeploy'
      ]
    },
    
    webhook_url: 'https://www.rugebrecho.com/api/webhooks/mercadopago',
    setup_guide: 'https://www.rugebrecho.com/api/debug/webhook-setup-guide',
    
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(check);
} 