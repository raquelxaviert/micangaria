import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const external_reference = searchParams.get('external_reference');

    console.log('🔍 [OrderStatus] Consulta de status recebida:', { external_reference });

    if (!external_reference) {
      return NextResponse.json(
        { success: false, error: 'external_reference is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Buscar o pedido pelo external_reference
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('external_reference', external_reference)
      .single();

    if (fetchError) {
      console.error('❌ [OrderStatus] Erro ao buscar pedido:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Order not found', details: fetchError.message },
        { status: 404 }
      );
    }

    console.log('✅ [OrderStatus] Pedido encontrado:', {
      id: order.id,
      status: order.status,
      external_reference: order.external_reference,
      payment_id: order.payment_id
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        external_reference: order.external_reference,
        total_amount: order.total_amount,
        created_at: order.created_at,
        updated_at: order.updated_at,
        payment_id: order.payment_id
      }
    });

  } catch (error) {
    console.error('💥 [OrderStatus] Erro interno:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
