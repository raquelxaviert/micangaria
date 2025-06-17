'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, CreditCard } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import Image from 'next/image';

export function OrderSummary() {
  const { data } = useCheckout();

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Resumo do Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {data.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-sm leading-tight truncate">
                  {item.name}
                </h4>                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Peça única
                  </span>
                  <span className="font-medium text-sm">
                    R$ {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {data.subtotal.toFixed(2)}</span>
          </div>
          
          {data.shipping && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Truck className="w-3 h-3" />
                <span>{data.shipping.name}</span>
              </div>
              <span>
                {data.shippingCost === 0 ? (
                  <Badge className="text-xs bg-green-100 text-green-800">
                    GRÁTIS
                  </Badge>
                ) : (
                  `R$ ${data.shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>R$ {data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer Info Preview */}
        {data.customer.name && (
          <>
            <Separator />
            <div className="space-y-2 text-xs">
              <h5 className="font-medium text-sm">Dados do Cliente:</h5>
              <p>{data.customer.name}</p>
              <p className="text-muted-foreground">{data.customer.email}</p>
              {data.customer.phone && (
                <p className="text-muted-foreground">{data.customer.phone}</p>
              )}
            </div>
          </>
        )}

        {/* Address Preview */}
        {data.shippingAddress.street && (
          <>
            <Separator />
            <div className="space-y-2 text-xs">
              <h5 className="font-medium text-sm">Endereço de Entrega:</h5>
              <p>
                {data.shippingAddress.street}, {data.shippingAddress.number}
                {data.shippingAddress.complement && `, ${data.shippingAddress.complement}`}
              </p>
              <p className="text-muted-foreground">
                {data.shippingAddress.neighborhood}, {data.shippingAddress.city} - {data.shippingAddress.state}
              </p>
              <p className="text-muted-foreground">{data.shippingAddress.zipCode}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
