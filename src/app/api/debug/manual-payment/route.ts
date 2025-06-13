import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Manual payment processing for testing - simulates what would happen if MP API was accessible
export async function POST(request: NextRequest) {
  try {
    const { paymentId, externalReference, status } = await request.json();
    
    if (!paymentId || !externalReference || !status) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['paymentId', 'externalReference', 'status'],
        received: { paymentId, externalReference, status }
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Map status to our internal status
    function mapStatus(mpStatus: string): string {
      switch (mpStatus) {
        case 'approved': return 'paid';
        case 'pending': return 'pending';
        case 'in_process': return 'processing';
        case 'rejected': return 'payment_failed';
        case 'cancelled': return 'cancelled';
        case 'refunded': return 'refunded';
        default: return 'pending';
      }
    }
    
    const mappedStatus = mapStatus(status);
    
    console.log(`[ManualPaymentProcessing] Processing payment ${paymentId} for external_reference ${externalReference} with status ${status} -> ${mappedStatus}`);
    
    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, external_reference')
      .eq('external_reference', externalReference)
      .single();

    if (fetchError) {
      console.error('[ManualPaymentProcessing] Error fetching order:', fetchError);
      return NextResponse.json({
        error: 'Order not found',
        external_reference: externalReference,
        details: fetchError.message
      }, { status: 404 });
    }
    
    console.log('[ManualPaymentProcessing] Found order:', existingOrder);
    
    // Update the order
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: mappedStatus,
        payment_id: paymentId.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('external_reference', externalReference)
      .select();

    if (error) {
      console.error('[ManualPaymentProcessing] Update error:', error);
      return NextResponse.json({
        error: 'Failed to update order',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('[ManualPaymentProcessing] Update successful:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      order_updated: data[0],
      payment_id: paymentId,
      external_reference: externalReference,
      old_status: existingOrder.status,
      new_status: mappedStatus
    });
    
  } catch (error: any) {
    console.error('[ManualPaymentProcessing] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: 'Manual Payment Processing Test',
    usage: 'POST with JSON body: { "paymentId": "1337620797", "externalReference": "RUGE1749846918464", "status": "approved" }',
    description: 'Simulates successful payment processing to test Supabase updates'
  });
}
