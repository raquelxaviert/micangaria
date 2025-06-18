import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externalRef = searchParams.get('external_ref') || searchParams.get('external_reference');
    const paymentId = searchParams.get('payment_id');
    const preferenceId = searchParams.get('preference_id');

    console.log('🔍 [DebugOrderStatus] Checking order status:', {
      externalRef,
      paymentId,
      preferenceId
    });

    if (!externalRef && !paymentId && !preferenceId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters. Use external_ref, payment_id, or preference_id'
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    let query = supabase.from('orders').select('*');
    
    if (externalRef) {
      query = query.eq('external_reference', externalRef);
    } else if (paymentId) {
      query = query.eq('payment_id', paymentId);
    } else if (preferenceId) {
      query = query.eq('preference_id', preferenceId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('❌ [DebugOrderStatus] Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ [DebugOrderStatus] Found orders:', orders?.length || 0);

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [DebugOrderStatus] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 