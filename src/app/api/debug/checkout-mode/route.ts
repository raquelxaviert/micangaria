import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simulate the checkout logic to see what mode it would use
  const isProduction = process.env.NODE_ENV === 'production';
  const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true' || !isProduction;
  
  const checkoutMode = {
    NODE_ENV: process.env.NODE_ENV,
    isProduction: isProduction,
    MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
    isSandbox: isSandbox,
    
    // What the checkout currently does
    current_behavior: {
      description: "Based on current environment variables",
      mode: isSandbox ? "SANDBOX" : "PRODUCTION",
      api_used: isSandbox ? "sandbox.mercadopago.com" : "api.mercadopago.com",
      token_needed: isSandbox ? "TEST-xxx" : "APP_USR-xxx",
      webhook_expects: "Production API (APP_USR token)"
    },
    
    // What would happen if we fix MERCADO_PAGO_SANDBOX
    recommended_fix: {
      description: "Set MERCADO_PAGO_SANDBOX=false in production",
      MERCADO_PAGO_SANDBOX_fixed: "false",
      isSandbox_fixed: false,
      mode_fixed: "PRODUCTION",
      result: "Checkout and webhook would both use production API"
    },
    
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(checkoutMode);
}
