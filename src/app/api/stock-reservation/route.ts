import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StockReservationService } from '@/lib/stockReservation';

export async function POST(request: NextRequest) {
  try {
    const { product_id, session_id, quantity = 1, reservation_duration_minutes = 15 } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verificar se o produto está disponível
    const isAvailable = await StockReservationService.isProductAvailable(product_id);
    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Product is not available' },
        { status: 409 }
      );
    }

    // Criar reserva
    const reservation = await StockReservationService.createReservation({
      product_id,
      user_id: user.id,
      session_id: session_id || `session_${Date.now()}`,
      quantity,
      reservation_duration_minutes,
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Failed to create reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation,
      expires_at: reservation.expires_at,
      remaining_minutes: StockReservationService.getRemainingTime(reservation)
    });

  } catch (error: any) {
    console.error('❌ [StockReservation API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Obter reservas ativas do usuário
    const reservations = await StockReservationService.getUserActiveReservations(user.id);

    return NextResponse.json({
      success: true,
      reservations: reservations.map(reservation => ({
        ...reservation,
        remaining_minutes: StockReservationService.getRemainingTime(reservation),
        is_near_expiration: StockReservationService.isNearExpiration(reservation)
      }))
    });

  } catch (error: any) {
    console.error('❌ [StockReservation API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reservation_id = searchParams.get('reservation_id');

    if (!reservation_id) {
      return NextResponse.json(
        { success: false, error: 'Reservation ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Cancelar reserva
    const success = await StockReservationService.cancelReservation(reservation_id, user.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to cancel reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ [StockReservation API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 