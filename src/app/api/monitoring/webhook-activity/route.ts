import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 📊 WEBHOOK MONITORING - Atividade Recente
 * 
 * Endpoint para monitorar a atividade recente dos webhooks
 * Útil para verificar se os pagamentos estão sendo processados
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Buscar pedidos das últimas 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentOrders, error } = await supabase
      .from('orders')
      .select('id, status, created_at, updated_at, payment_id, external_reference, total_amount')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[WebhookMonitoring] Supabase error:', error);
      return NextResponse.json({
        error: 'Failed to fetch recent orders',
        details: error.message
      }, { status: 500 });
    }

    // Analisar estatísticas
    const stats = {
      total_orders: recentOrders?.length || 0,
      by_status: {} as Record<string, number>,
      paid_orders: 0,
      pending_orders: 0,
      failed_orders: 0,
      total_revenue: 0,
      webhook_processing_rate: 0
    };

    recentOrders?.forEach(order => {
      const status = order.status;
      stats.by_status[status] = (stats.by_status[status] || 0) + 1;
      
      if (status === 'paid') {
        stats.paid_orders++;
        stats.total_revenue += order.total_amount || 0;
      } else if (status === 'pending') {
        stats.pending_orders++;
      } else if (status === 'payment_failed' || status === 'cancelled') {
        stats.failed_orders++;
      }
    });

    // Taxa de processamento do webhook (orders com payment_id = processados pelo webhook)
    const processedByWebhook = recentOrders?.filter(order => order.payment_id)?.length || 0;
    stats.webhook_processing_rate = stats.total_orders > 0 
      ? Math.round((processedByWebhook / stats.total_orders) * 100) 
      : 0;

    // Identificar possíveis problemas
    const alerts = [];
    
    if (stats.pending_orders > stats.paid_orders && stats.total_orders > 5) {
      alerts.push({
        level: 'warning',
        message: 'Alto número de pedidos pendentes - webhook pode estar com problemas'
      });
    }
    
    if (stats.webhook_processing_rate < 80 && stats.total_orders > 3) {
      alerts.push({
        level: 'warning',
        message: `Taxa de processamento do webhook baixa: ${stats.webhook_processing_rate}%`
      });
    }

    if (stats.total_orders === 0) {
      alerts.push({
        level: 'info',
        message: 'Nenhum pedido nas últimas 24 horas'
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      period: 'last_24_hours',
      statistics: stats,
      alerts,
      recent_orders: recentOrders?.slice(0, 10).map(order => ({
        id: order.id,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        external_reference: order.external_reference,
        has_payment_id: !!order.payment_id,
        amount: order.total_amount
      })),
      webhook_health: {
        processing_rate: `${stats.webhook_processing_rate}%`,
        status: stats.webhook_processing_rate >= 90 ? 'excellent' :
                stats.webhook_processing_rate >= 70 ? 'good' :
                stats.webhook_processing_rate >= 50 ? 'fair' : 'poor'
      }
    });

  } catch (error: any) {
    console.error('[WebhookMonitoring] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
