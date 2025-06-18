'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, CreditCard, Truck, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  created_at: string;
  external_reference: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  status: string;
  payment_status: string;
  shipping_status: string;
  items: any[];
  customer_info: {
    name: string;
    email: string;
    phone?: string;
  };
  shipping_address: any;
}

export default function MeusPedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      paid: { label: 'Pago', variant: 'default' as const },
      shipped: { label: 'Enviado', variant: 'default' as const },
      delivered: { label: 'Entregue', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'secondary' as const 
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando pedidos...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchOrders} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-headline text-primary mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe o status dos seus pedidos e histórico de compras
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não fez nenhum pedido. Que tal explorar nossos produtos?
              </p>
              <Button asChild>
                <Link href="/products">Explorar Produtos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg">
                      Pedido #{order.external_reference}
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatDate(order.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Miniaturas dos produtos */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Produtos</h4>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border">
                              {item.imageUrl ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-center mt-1 max-w-16 truncate">
                              {item.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Items</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-xs sm:text-sm text-muted-foreground">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Status do Pagamento</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {order.payment_status || 'Pendente'}
                      </p>
                      
                      <h4 className="font-medium mb-2 mt-3 text-sm sm:text-base">Status do Envio</h4>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                        {order.shipping_status || 'Preparando'}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-sm sm:text-base">Resumo</h4>
                      <div className="text-xs sm:text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frete:</span>
                          <span>{formatPrice(order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Ver Detalhes</span>
                      <span className="sm:hidden">Ver Detalhes</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
