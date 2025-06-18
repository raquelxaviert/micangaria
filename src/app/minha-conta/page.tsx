'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Package, 
  Settings, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  CreditCard,
  Truck,
  Edit,
  LogOut,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  created_at: string;
  external_reference: string;
  total: number;
  status: string;
  payment_status: string;
  items: any[];
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  created_at: string;
}

export default function MinhaContaPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteItems: 0
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchUserData();
    }
  }, [user, authLoading, router]);

  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      
      // Buscar dados do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Buscar pedidos recentes
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) {
        console.error('Erro ao buscar pedidos:', ordersError);
      }

      // Buscar estatísticas
      const { data: allOrders, error: statsError } = await supabase
        .from('orders')
        .select('total, status')
        .eq('user_id', user?.id);

      if (statsError) {
        console.error('Erro ao buscar estatísticas:', statsError);
      }

      // Calcular estatísticas
      const totalOrders = allOrders?.length || 0;
      const totalSpent = allOrders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
      const favoriteItems = 0; // TODO: Implementar sistema de favoritos

      setProfile(profileData || {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name,
        created_at: user?.created_at || ''
      });
      setRecentOrders(ordersData || []);
      setStats({ totalOrders, totalSpent, favoriteItems });

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
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
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando sua conta...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline text-primary mb-2">Minha Conta</h1>
          <p className="text-muted-foreground">
            Gerencie seus dados pessoais, pedidos e preferências
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {profile?.full_name || 'Usuário'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Membro desde {formatDate(profile?.created_at || '')}</span>
                  </div>
                  
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  )}

                  {profile?.address?.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.address.city}, {profile.address.state}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Gasto</p>
                      <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Favoritos</p>
                      <p className="text-2xl font-bold">{stats.favoriteItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Pedidos Recentes
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/minha-conta/pedidos">
                      Ver Todos
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Você ainda não fez nenhum pedido
                    </p>
                    <Button asChild>
                      <Link href="/products">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Explorar Produtos
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">
                              Pedido #{order.external_reference}
                            </h4>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(order.created_at)}</span>
                            <span>{formatPrice(order.total)}</span>
                            <span>{order.items?.length || 0} item(s)</span>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/minha-conta/pedidos/${order.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/minha-conta/pedidos">
                      <div className="flex items-center gap-3">
                        <Package className="w-6 h-6" />
                        <div className="text-left">
                          <p className="font-medium">Meus Pedidos</p>
                          <p className="text-sm text-muted-foreground">
                            Acompanhe seus pedidos
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/minha-conta/perfil">
                      <div className="flex items-center gap-3">
                        <Edit className="w-6 h-6" />
                        <div className="text-left">
                          <p className="font-medium">Editar Perfil</p>
                          <p className="text-sm text-muted-foreground">
                            Atualize seus dados
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/products">
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6" />
                        <div className="text-left">
                          <p className="font-medium">Continuar Comprando</p>
                          <p className="text-sm text-muted-foreground">
                            Explore mais produtos
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/cart">
                      <div className="flex items-center gap-3">
                        <Truck className="w-6 h-6" />
                        <div className="text-left">
                          <p className="font-medium">Meu Carrinho</p>
                          <p className="text-sm text-muted-foreground">
                            Finalize suas compras
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 