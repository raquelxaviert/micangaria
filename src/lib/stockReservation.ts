import { createClient } from '@/lib/supabase/server';

export interface StockReservation {
  id: string;
  product_id: string;
  user_id: string;
  session_id: string;
  quantity: number;
  reserved_at: string;
  expires_at: string;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
  order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationData {
  product_id: string;
  user_id: string;
  session_id: string;
  quantity?: number;
  reservation_duration_minutes?: number;
}

export class StockReservationService {
  private static readonly DEFAULT_RESERVATION_DURATION = 15; // 15 minutos
  private static readonly MAX_RESERVATION_DURATION = 30; // 30 minutos máximo

  /**
   * Criar uma reserva de estoque
   */
  static async createReservation(data: CreateReservationData): Promise<StockReservation | null> {
    try {
      const supabase = await createClient();
      
      const duration = Math.min(
        data.reservation_duration_minutes || this.DEFAULT_RESERVATION_DURATION,
        this.MAX_RESERVATION_DURATION
      );
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + duration);

      // Verificar se o produto está disponível
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, stock_available, stock_reserved')
        .eq('id', data.product_id)
        .single();

      if (productError || !product) {
        console.error('❌ [StockReservation] Produto não encontrado:', data.product_id);
        return null;
      }

      if (product.stock_available <= 0) {
        console.error('❌ [StockReservation] Produto sem estoque disponível:', data.product_id);
        return null;
      }

      // Verificar se já existe uma reserva ativa para este usuário
      const { data: existingReservation, error: existingError } = await supabase
        .from('stock_reservations')
        .select('*')
        .eq('product_id', data.product_id)
        .eq('user_id', data.user_id)
        .eq('status', 'active')
        .single();

      if (existingReservation) {
        console.log('🔄 [StockReservation] Reserva existente encontrada, estendendo...');
        
        // Estender a reserva existente
        const { data: updatedReservation, error: updateError } = await supabase
          .from('stock_reservations')
          .update({
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReservation.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ [StockReservation] Erro ao estender reserva:', updateError);
          return null;
        }

        return updatedReservation;
      }

      // Criar nova reserva
      const { data: reservation, error } = await supabase
        .from('stock_reservations')
        .insert({
          product_id: data.product_id,
          user_id: data.user_id,
          session_id: data.session_id,
          quantity: data.quantity || 1,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [StockReservation] Erro ao criar reserva:', error);
        return null;
      }

      console.log('✅ [StockReservation] Reserva criada:', {
        id: reservation.id,
        product_id: reservation.product_id,
        expires_at: reservation.expires_at,
        duration_minutes: duration
      });

      return reservation;
    } catch (error) {
      console.error('❌ [StockReservation] Erro inesperado:', error);
      return null;
    }
  }

  /**
   * Verificar se um produto está disponível para reserva
   */
  static async isProductAvailable(productId: string): Promise<boolean> {
    try {
      const supabase = await createClient();
      
      const { data: product, error } = await supabase
        .from('products')
        .select('stock_available, stock_reserved')
        .eq('id', productId)
        .single();

      if (error || !product) {
        return false;
      }

      return product.stock_available > 0;
    } catch (error) {
      console.error('❌ [StockReservation] Erro ao verificar disponibilidade:', error);
      return false;
    }
  }

  /**
   * Obter reservas ativas de um usuário
   */
  static async getUserActiveReservations(userId: string): Promise<StockReservation[]> {
    try {
      const supabase = await createClient();
      
      const { data: reservations, error } = await supabase
        .from('stock_reservations')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

      if (error) {
        console.error('❌ [StockReservation] Erro ao buscar reservas:', error);
        return [];
      }

      return reservations || [];
    } catch (error) {
      console.error('❌ [StockReservation] Erro inesperado:', error);
      return [];
    }
  }

  /**
   * Cancelar uma reserva
   */
  static async cancelReservation(reservationId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('stock_reservations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ [StockReservation] Erro ao cancelar reserva:', error);
        return false;
      }

      console.log('✅ [StockReservation] Reserva cancelada:', reservationId);
      return true;
    } catch (error) {
      console.error('❌ [StockReservation] Erro inesperado:', error);
      return false;
    }
  }

  /**
   * Marcar reserva como concluída (pagamento realizado)
   */
  static async completeReservation(reservationId: string, orderId: string): Promise<boolean> {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('stock_reservations')
        .update({
          status: 'completed',
          order_id: orderId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId);

      if (error) {
        console.error('❌ [StockReservation] Erro ao completar reserva:', error);
        return false;
      }

      console.log('✅ [StockReservation] Reserva completada:', { reservationId, orderId });
      return true;
    } catch (error) {
      console.error('❌ [StockReservation] Erro inesperado:', error);
      return false;
    }
  }

  /**
   * Limpar reservas expiradas (deve ser executado periodicamente)
   */
  static async cleanupExpiredReservations(): Promise<number> {
    try {
      const supabase = await createClient();
      
      // Executar função de limpeza
      const { data, error } = await supabase.rpc('cleanup_expired_reservations');
      
      if (error) {
        console.error('❌ [StockReservation] Erro ao limpar reservas expiradas:', error);
        return 0;
      }

      console.log('✅ [StockReservation] Limpeza de reservas expiradas executada');
      return 1;
    } catch (error) {
      console.error('❌ [StockReservation] Erro inesperado:', error);
      return 0;
    }
  }

  /**
   * Obter tempo restante de uma reserva em minutos
   */
  static getRemainingTime(reservation: StockReservation): number {
    const expiresAt = new Date(reservation.expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60)));
  }

  /**
   * Verificar se uma reserva está próxima de expirar (últimos 5 minutos)
   */
  static isNearExpiration(reservation: StockReservation): boolean {
    const remainingMinutes = this.getRemainingTime(reservation);
    return remainingMinutes <= 5 && remainingMinutes > 0;
  }
} 