import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Função para converter UTC para horário brasileiro (UTC-3)
function convertToBrazilianTime(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);
  // Converter para UTC-3 (horário de Brasília)
  const brazilTime = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return brazilTime.toISOString().replace('T', ' ').substring(0, 19) + ' (BR)';
}

export async function GET(request: NextRequest) {
  const externalRef = request.nextUrl.searchParams.get('external_ref');
  const preferenceId = request.nextUrl.searchParams.get('preference_id');
  
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('orders')
      .select('id, status, external_reference, preference_id, payment_id, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (externalRef) {
      query = query.eq('external_reference', externalRef);
    } else if (preferenceId) {
      query = query.eq('preference_id', preferenceId);
    } else {
      query = query.limit(10); // Show last 10 orders if no filter
    }
    
    const { data: orders, error } = await query;
    
    if (error) {
      console.error('[OrdersDebug] Supabase error:', error);
      return NextResponse.json({
        error: 'Failed to fetch orders',
        details: error.message
      }, { status: 500 });
    }
      // Converter horários para fuso brasileiro
    const ordersWithBrazilianTime = orders?.map(order => ({
      ...order,
      created_at_utc: order.created_at,
      updated_at_utc: order.updated_at,
      created_at: convertToBrazilianTime(order.created_at),
      updated_at: order.updated_at ? convertToBrazilianTime(order.updated_at) : null
    }));
      return NextResponse.json({
      success: true,
      total: ordersWithBrazilianTime?.length || 0,
      orders: ordersWithBrazilianTime || [],
      timezone_info: {
        display: 'Brazilian Time (UTC-3)',
        note: 'Original UTC timestamps available as *_utc fields'
      },
      query_params: {
        external_ref: externalRef,
        preference_id: preferenceId
      },
      usage: 'Add ?external_ref=REF or ?preference_id=PREF to filter specific order'
    });
    
  } catch (error: any) {
    console.error('[OrdersDebug] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}
