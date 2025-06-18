import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  remaining_minutes?: number;
  is_near_expiration?: boolean;
  products?: {
    id: string;
    title: string;
    price: number;
    image_url: string;
  };
}

// Cache simples para evitar requisições desnecessárias
const productStatusCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 segundos

// Hook para verificar status de um produto específico
export function useProductStockStatus(productId: string) {
  const [isReserved, setIsReserved] = useState(false);
  const [isSold, setIsSold] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Verificar status do produto com cache
  const checkProductStatus = useCallback(async () => {
    if (!productId) return;

    // Verificar cache primeiro
    const cached = productStatusCache.get(productId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const data = cached.data;
      setIsReserved(data.isReserved);
      setIsSold(data.isSold);
      setExpiresAt(data.expiresAt ? new Date(data.expiresAt) : null);
      setIsLoading(false);
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stock-reservation/product-status?product_id=${productId}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setIsReserved(data.isReserved);
        setIsSold(data.isSold);
        
        if (data.expiresAt) {
          setExpiresAt(new Date(data.expiresAt));
        } else {
          setExpiresAt(null);
        }

        // Salvar no cache
        productStatusCache.set(productId, {
          data: {
            isReserved: data.isReserved,
            isSold: data.isSold,
            expiresAt: data.expiresAt
          },
          timestamp: Date.now()
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Requisição foi cancelada, não fazer nada
        return;
      }
      console.error('Error checking product status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Verificar status inicial
  useEffect(() => {
    checkProductStatus();
    
    // Cleanup ao desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkProductStatus]);

  // Calcular countdown localmente
  useEffect(() => {
    if (!expiresAt || !isReserved) {
      setTimeRemaining('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('');
        setIsReserved(false);
        // Limpar cache quando expirar
        productStatusCache.delete(productId);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    // Atualizar imediatamente
    updateCountdown();

    // Atualizar a cada segundo
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isReserved, productId]);

  return {
    isReserved,
    isSold,
    timeRemaining,
    isLoading,
    checkProductStatus
  };
}

export function useStockReservation() {
  const [reservations, setReservations] = useState<StockReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar reservas ativas
  const loadReservations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stock-reservation');
      const data = await response.json();

      if (data.success) {
        setReservations(data.reservations);
      } else {
        setError(data.error || 'Failed to load reservations');
      }
    } catch (err) {
      setError('Failed to load reservations');
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Criar reserva
  const createReservation = useCallback(async (
    productId: string, 
    quantity: number = 1, 
    durationMinutes: number = 15
  ): Promise<StockReservation | null> => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para reservar produtos.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stock-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          reservation_duration_minutes: durationMinutes,
          session_id: `session_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Produto reservado!",
          description: `Você tem ${data.remaining_minutes} minutos para finalizar a compra.`,
        });

        // Recarregar reservas
        await loadReservations();
        return data.reservation;
      } else {
        if (data.error === 'Product is not available') {
          toast({
            title: "❌ Produto indisponível",
            description: "Este produto não está mais disponível para reserva.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ Erro ao reservar",
            description: data.error || "Não foi possível reservar o produto.",
            variant: "destructive",
          });
        }
        setError(data.error);
        return null;
      }
    } catch (err) {
      const errorMessage = 'Erro ao reservar produto';
      setError(errorMessage);
      toast({
        title: "❌ Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, loadReservations]);

  // Cancelar reserva
  const cancelReservation = useCallback(async (reservationId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stock-reservation?reservation_id=${reservationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Reserva cancelada",
          description: "O produto foi liberado para outros compradores.",
        });

        // Recarregar reservas
        await loadReservations();
        return true;
      } else {
        toast({
          title: "❌ Erro ao cancelar",
          description: data.error || "Não foi possível cancelar a reserva.",
          variant: "destructive",
        });
        setError(data.error);
        return false;
      }
    } catch (err) {
      const errorMessage = 'Erro ao cancelar reserva';
      setError(errorMessage);
      toast({
        title: "❌ Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, loadReservations]);

  // Verificar se um produto está reservado pelo usuário atual
  const isProductReservedByUser = useCallback((productId: string): boolean => {
    return reservations.some(reservation => 
      reservation.product_id === productId && 
      reservation.status === 'active'
    );
  }, [reservations]);

  // Obter reserva de um produto específico
  const getProductReservation = useCallback((productId: string): StockReservation | null => {
    return reservations.find(reservation => 
      reservation.product_id === productId && 
      reservation.status === 'active'
    ) || null;
  }, [reservations]);

  // Carregar reservas quando o usuário mudar
  useEffect(() => {
    if (user) {
      loadReservations();
    } else {
      setReservations([]);
    }
  }, [user, loadReservations]);

  // Atualizar reservas a cada minuto para mostrar tempo restante
  useEffect(() => {
    if (!user || reservations.length === 0) return;

    const interval = setInterval(() => {
      setReservations(prev => prev.map(reservation => {
        const expiresAt = new Date(reservation.expires_at);
        const now = new Date();
        const diffMs = expiresAt.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.ceil(diffMs / (1000 * 60)));
        const isNearExpiration = remainingMinutes <= 5 && remainingMinutes > 0;

        return {
          ...reservation,
          remaining_minutes: remainingMinutes,
          is_near_expiration: isNearExpiration,
        };
      }));
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [user, reservations.length]);

  return {
    reservations,
    loading,
    error,
    createReservation,
    cancelReservation,
    loadReservations,
    isProductReservedByUser,
    getProductReservation,
  };
} 