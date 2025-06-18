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

    // Fazer uma única consulta mais eficiente usando Promise.all
    const [soldOrderResult, activeReservationResult] = await Promise.all([
      // Verificar se o produto foi vendido (tem pedido com status 'paid')
      supabase
        .from('orders')
        .select('id')
        .eq('status', 'paid')
        .filter('items', 'cs', `[{"id":"${productId}"}]`)
        .limit(1)
        .maybeSingle(),
      
      // Verificar se há reservas ativas para este produto
      supabase
        .from('stock_reservations')
        .select('expires_at')
        .eq('product_id', productId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .limit(1)
        .maybeSingle()
    ]);

    // Verificar se foi vendido
    if (soldOrderResult.data) {
      console.log('✅ [ProductStatus] Produto vendido encontrado:', productId);
      return NextResponse.json({
        success: true,
        isReserved: false,
        isSold: true,
        expiresAt: null
      });
    }

    // Verificar se está reservado
    if (activeReservationResult.data) {
      console.log('⏰ [ProductStatus] Produto reservado encontrado:', productId);
      return NextResponse.json({
        success: true,
        isReserved: true,
        isSold: false,
        expiresAt: activeReservationResult.data.expires_at
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