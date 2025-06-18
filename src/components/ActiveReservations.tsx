'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useStockReservation } from '@/hooks/useStockReservation';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { SimpleFastImage } from '@/components/ui/SimpleFastImage';

export function ActiveReservations() {
  const { reservations, loading, cancelReservation } = useStockReservation();
  const { toast } = useToast();

  const handleCancelReservation = async (reservationId: string) => {
    const success = await cancelReservation(reservationId);
    if (success) {
      toast({
        title: "✅ Reserva cancelada",
        description: "O produto foi liberado para outros compradores.",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Carregando reservas...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reservations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Produtos Reservados
          <Badge variant="secondary" className="ml-2">
            {reservations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const isNearExpiration = reservation.is_near_expiration;
            const remainingMinutes = reservation.remaining_minutes || 0;
            
            return (
              <div
                key={reservation.id}
                className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                  isNearExpiration
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {reservation.products && (
                    <SimpleFastImage
                      src={reservation.products.image_url}
                      alt={reservation.products.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {reservation.products?.title || 'Produto'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantidade: {reservation.quantity}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {isNearExpiration ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            isNearExpiration ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {remainingMinutes} min restantes
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {isNearExpiration && (
                      <div className="mt-2 p-2 bg-red-100 rounded-md">
                        <p className="text-xs text-red-700 font-medium">
                          ⚠️ Sua reserva expira em breve! Finalize o pagamento para garantir sua compra.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 <strong>Dica:</strong> Os produtos ficam reservados por 30 minutos. 
            Finalize o pagamento para garantir sua compra e liberar o estoque para outros compradores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 