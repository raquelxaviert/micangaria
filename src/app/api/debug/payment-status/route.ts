import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentService } from '@/lib/mercadopago/client';

export async function POST(request: NextRequest) {
  try {
    const { payment_id, external_reference } = await request.json();
    
    console.log(`🔍 [DEBUG] Checking payment status for ID: ${payment_id}, External Reference: ${external_reference}`);
    
    const results: any = {};
    
    // 1. Check Mercado Pago payment status
    if (payment_id) {
      try {
        const paymentDetails = await paymentService.get({ id: payment_id });
        results.mercadopago = {
          id: paymentDetails.id,
          status: paymentDetails.status,
          external_reference: paymentDetails.external_reference,
          status_detail: paymentDetails.status_detail,
          date_created: paymentDetails.date_created,
          date_approved: paymentDetails.date_approved
        };
        console.log(`✅ [DEBUG] Mercado Pago payment found:`, results.mercadopago);
      } catch (error: any) {
        results.mercadopago_error = error.message;
        console.log(`❌ [DEBUG] Mercado Pago error:`, error.message);
      }
    }
    
    // 2. Check Supabase order status
    const supabase = await createClient();
    
    if (external_reference) {
      const { data: orderByRef, error: refError } = await supabase
        .from('orders')
        .select('*')
        .eq('external_reference', external_reference);
        
      results.supabase_by_external_reference = {
        data: orderByRef,
        error: refError
      };
      console.log(`🗄️ [DEBUG] Supabase order by external_reference:`, results.supabase_by_external_reference);
    }
    
    if (payment_id) {
      const { data: orderByPayment, error: paymentError } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_id', payment_id.toString());
        
      results.supabase_by_payment_id = {
        data: orderByPayment,
        error: paymentError
      };
      console.log(`🗄️ [DEBUG] Supabase order by payment_id:`, results.supabase_by_payment_id);
    }
    
    // 3. List recent orders for comparison
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, status, external_reference, payment_id, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(5);
      
    results.recent_orders = {
      data: recentOrders,
      error: recentError
    };
    console.log(`📋 [DEBUG] Recent orders:`, results.recent_orders);
    
    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('❌ [DEBUG] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Payment Status Debug Endpoint',
    usage: 'POST with { "payment_id": "123", "external_reference": "order_xyz" }',
    timestamp: new Date().toISOString()
  });
}
