import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔍 HEALTH CHECK - Sistema de Pagamentos
 * 
 * Endpoint para verificar a saúde geral do sistema de pagamentos
 * Útil para monitoramento e alertas automáticos
 */

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  try {
    // Verificar variáveis de ambiente críticas
    const criticalEnvVars = {
      MERCADO_PAGO_ACCESS_TOKEN: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    };

    // Verificar se todas as variáveis críticas estão configuradas
    const missingVars = Object.entries(criticalEnvVars)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    const envStatus = missingVars.length === 0 ? 'healthy' : 'warning';

    // Status do sistema
    const systemStatus = {
      status: envStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp,
      environment: process.env.NODE_ENV || 'unknown',
      sandbox_mode: process.env.MERCADO_PAGO_SANDBOX === 'true',
      checks: {
        environment_variables: {
          status: envStatus,
          configured: criticalEnvVars,
          missing: missingVars
        },
        webhook_endpoint: {
          status: 'healthy',
          url: `${request.nextUrl.origin}/api/webhooks/mercadopago`
        },
        database_connection: {
          status: 'unknown', // Seria preciso fazer uma query para verificar
          note: 'Supabase connection not tested in health check'
        }
      },
      endpoints: {
        webhook: '/api/webhooks/mercadopago',
        create_preference: '/api/checkout/create-preference',
        order_status: '/api/orders/status',
        debug_orders: '/api/debug/orders',
        debug_payment_methods: '/api/debug/payment-methods'
      }
    };

    return NextResponse.json(systemStatus, { 
      status: systemStatus.status === 'healthy' ? 200 : 503 
    });

  } catch (error: any) {
    console.error('[HealthCheck] Error during health check:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp,
      error: error.message,
      environment: process.env.NODE_ENV || 'unknown'
    }, {
      status: 503
    });
  }
}
