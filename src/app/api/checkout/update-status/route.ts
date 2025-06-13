import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { external_reference, payment_id, status, mp_status } = body;

    console.log('🔄 [UpdateStatus] Received request:', {
      external_reference,
      payment_id,
      status,
      mp_status
    });

    if (!external_reference) {
      return NextResponse.json(
        { success: false, error: 'external_reference is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Primeiro buscar o pedido existente
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('external_reference', external_reference)
      .single();

    if (fetchError) {
      console.error('❌ [UpdateStatus] Error fetching order:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Order not found', details: fetchError.message },
        { status: 404 }
      );
    }

    console.log('🔍 [UpdateStatus] Found existing order:', {
      id: existingOrder.id,
      current_status: existingOrder.status,
      external_reference: existingOrder.external_reference
    });

    // Verificar se o status já está como 'paid' (evitar duplicação)
    if (existingOrder.status === 'paid') {
      console.log('✅ [UpdateStatus] Order already paid, returning existing data');
      return NextResponse.json({
        success: true,
        message: 'Order already marked as paid',
        order: existingOrder,
        updated: false
      });
    }

    // Atualizar o status do pedido
    const updateData = {
      status: status || 'paid',
      updated_at: new Date().toISOString(),
      ...(payment_id && { payment_id: payment_id.toString() }),
      ...(mp_status && { mp_status: mp_status })
    };

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('external_reference', external_reference)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [UpdateStatus] Error updating order:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ [UpdateStatus] Order updated successfully:', {
      id: updatedOrder.id,
      status: updatedOrder.status,
      payment_id: updatedOrder.payment_id
    });

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
      updated: true
    });

  } catch (error: any) {
    console.error('❌ [UpdateStatus] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Checkout Update Status API',
    description: 'Use POST method to update order status based on external_reference',
    usage: {
      method: 'POST',
      body: {
        external_reference: 'RUGE1234567890',
        payment_id: 'optional_mp_payment_id',
        status: 'paid|pending|failed',
        mp_status: 'optional_mp_status'
      }
    }
  });
}
