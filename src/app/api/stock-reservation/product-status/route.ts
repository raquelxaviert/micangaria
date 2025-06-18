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

    // Verificar se o produto está vendido (tem reserva completed)
    const { data: soldReservation, error: soldError } = await supabase
      .from('stock_reservations')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single();

    if (soldError && soldError.code !== 'PGRST116') {
      console.error('Error checking sold status:', soldError);
    }

    if (soldReservation) {
      return NextResponse.json({
        success: true,
        isReserved: false,
        isSold: true,
        expiresAt: null
      });
    }

    // Verificar se o produto está reservado (tem reserva active)
    const { data: activeReservation, error: activeError } = await supabase
      .from('stock_reservations')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (activeError && activeError.code !== 'PGRST116') {
      console.error('Error checking active reservation:', activeError);
    }

    if (activeReservation) {
      return NextResponse.json({
        success: true,
        isReserved: true,
        isSold: false,
        expiresAt: activeReservation.expires_at
      });
    }

    // Produto está disponível
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