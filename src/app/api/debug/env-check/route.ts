import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ? 
      process.env.MERCADO_PAGO_ACCESS_TOKEN.substring(0, 20) + '...' : 'NOT_SET',
    MERCADOPAGO_WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET ? 
      process.env.MERCADOPAGO_WEBHOOK_SECRET.substring(0, 10) + '...' : 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
      process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT_SET',
  };

  return NextResponse.json({
    status: 'Environment check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    variables: envVars,
    hasMercadoPagoToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
    hasWebhookSecret: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
    hasSupabaseConfig: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  });
}
