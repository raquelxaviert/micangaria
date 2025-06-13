import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'SET' : 'NOT_SET',
      MERCADO_PAGO_WEBHOOK_SECRET: process.env.MERCADO_PAGO_WEBHOOK_SECRET ? 'SET' : 'NOT_SET',
      MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY ? 'SET' : 'NOT_SET',
      MERCADO_PAGO_SANDBOX_ACCESS_TOKEN: process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN ? 'SET' : 'NOT_SET',
      
      // Check if tokens are sandbox or production
      access_token_type: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('APP_USR_') ? 'PRODUCTION' : 
                        process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-') ? 'SANDBOX' : 'UNKNOWN',
      
      public_key_type: process.env.MERCADO_PAGO_PUBLIC_KEY?.startsWith('APP_USR_') ? 'PRODUCTION' : 
                      process.env.MERCADO_PAGO_PUBLIC_KEY?.startsWith('TEST-') ? 'SANDBOX' : 'UNKNOWN',
    },
    timestamp: new Date().toISOString()
  });
}
