import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Usar cliente Supabase com chave anônima para permitir acesso público
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar se o produto foi vendido (tem pedido com status 'paid')
    const { data: soldOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .filter('items', 'cs', `[{"id":"${productId}"}]`)
      .single();

    if (orderError && orderError.code !== 'PGRST116') {
      console.error('Error checking sold order:', orderError);
    }

    if (soldOrder) {
      console.log('✅ [ProductStatus] Produto vendido encontrado:', productId);
      return NextResponse.json({
        success: true,
        isReserved: false,
        isSold: true,
        expiresAt: null
      });
    }

    // Verificar se há reservas ativas para este produto
    const { data: activeReservation, error: reservationError } = await supabase
      .from('stock_reservations')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (reservationError && reservationError.code !== 'PGRST116') {
      console.error('Error checking active reservation:', reservationError);
    }

    if (activeReservation) {
      console.log('⏰ [ProductStatus] Produto reservado encontrado:', productId);
      return NextResponse.json({
        success: true,
        isReserved: true,
        isSold: false,
        expiresAt: activeReservation.expires_at
      });
    }

    // Produto está disponível
    console.log('✅ [ProductStatus] Produto disponível:', productId);
    return NextResponse.json({
      success: true,
      isReserved: false,
      isSold: false,
      expiresAt: null
    });

  } catch (error) {
    console.error('Error in product status check:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 