import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
    MELHOR_ENVIO_SANDBOX: process.env.MELHOR_ENVIO_SANDBOX,
    has_mercado_pago_token: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
    has_sandbox_token: !!process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN,
    production_token_prefix: process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 10) || 'NOT_SET',
    sandbox_token_prefix: process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN?.substring(0, 10) || 'NOT_SET',
    is_token_test: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-') || false,
    is_token_prod: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('APP_') || false,    webhook_secret_set: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
    webhook_secret_length: process.env.MERCADOPAGO_WEBHOOK_SECRET?.length || 0,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(envInfo);
}
