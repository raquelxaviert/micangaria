import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { test_production_mode } = await request.json();
    
    // Simular as configurações corretas
    const mockEnv = {
      // Simular MERCADO_PAGO_SANDBOX=false (modo produção da conta de teste)
      MERCADO_PAGO_SANDBOX: test_production_mode ? 'false' : process.env.MERCADO_PAGO_SANDBOX,
      NODE_ENV: process.env.NODE_ENV
    };
    
    // Lógica do checkout (copiada de create-preference)
    const isProduction = mockEnv.NODE_ENV === 'production';
    const isSandbox = mockEnv.MERCADO_PAGO_SANDBOX === 'true' || !isProduction;
    
    return NextResponse.json({
      current_config: {
        NODE_ENV: process.env.NODE_ENV,
        MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
        isProduction,
        isSandbox_current: process.env.MERCADO_PAGO_SANDBOX === 'true' || !isProduction,
        problem: 'MERCADO_PAGO_SANDBOX=true força sandbox, mas token é de produção da conta de teste'
      },
      
      simulated_config: {
        MERCADO_PAGO_SANDBOX: mockEnv.MERCADO_PAGO_SANDBOX,
        NODE_ENV: mockEnv.NODE_ENV,
        isProduction,
        isSandbox_simulated: isSandbox,
        solution: test_production_mode ? 'Usar produção da conta de teste' : 'Configuração atual (problema)'
      },
      
      recommendation: {
        action: 'Definir MERCADO_PAGO_SANDBOX=false no Vercel',
        reason: 'Token APP_USR-... é de produção da conta de teste, não sandbox',
        steps: [
          '1. Ir no painel do Vercel',
          '2. Projeto > Settings > Environment Variables',
          '3. Editar MERCADO_PAGO_SANDBOX para "false"',
          '4. Redeploy o projeto',
          '5. Testar novo checkout'
        ]
      },
      
      token_info: {
        has_token: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
        token_type: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('APP_USR_') ? 'PRODUÇÃO (conta de teste)' : 
                   process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-') ? 'SANDBOX' : 'DESCONHECIDO',
        webhook_secret_set: !!process.env.MERCADO_PAGO_WEBHOOK_SECRET
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Configuração de Ambiente - Mercado Pago',
    usage: 'POST com { "test_production_mode": true } para simular configuração correta',
    problema: 'MERCADO_PAGO_SANDBOX=true com token de produção da conta de teste',
    solução: 'Definir MERCADO_PAGO_SANDBOX=false no Vercel'
  });
}
