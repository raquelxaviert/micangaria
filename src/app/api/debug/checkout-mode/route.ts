import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simulate the checkout logic to see what mode it would use
  const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true';
  
  const checkoutMode = {
    NODE_ENV: process.env.NODE_ENV,
    MERCADO_PAGO_SANDBOX: process.env.MERCADO_PAGO_SANDBOX,
    isSandbox: isSandbox,
    
    // What the checkout currently does
    current_behavior: {
      description: "Based on MERCADO_PAGO_SANDBOX environment variable",
      mode: isSandbox ? "SANDBOX" : "PRODUCTION",
      api_used: isSandbox ? "sandbox.mercadopago.com" : "api.mercadopago.com",
      token_needed: "APP_USR-xxx (production credentials from test account)",
      webhook_expects: "Production API (APP_USR token)"
    },
    
    // What would happen if we fix MERCADO_PAGO_SANDBOX
    recommended_fix: {
      description: "Set MERCADO_PAGO_SANDBOX=true to use sandbox",
      MERCADO_PAGO_SANDBOX_fixed: "true",
      isSandbox_fixed: true,
      mode_fixed: "SANDBOX",
      result: "Checkout would use sandbox_init_point"
    },
    
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(checkoutMode);
}
