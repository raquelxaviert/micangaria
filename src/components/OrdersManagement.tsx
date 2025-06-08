'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  Download,
  Mail,
  Phone
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dados simulados de pedidos
const mockOrders = [
  {
    id: '1',
    sessionId: 'cs_test_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6',
    customerName: 'Maria Silva',
    customerEmail: 'maria@email.com',
    customerPhone: '(11) 99999-1234',
    amount: 15900, // R$ 159,00
    status: 'paid',
    orderStatus: 'preparing',
    items: [
      { name: 'Colar Mandala Dourado', quantity: 1, price: 8900 },
      { name: 'Pulseira Étnica Azul', quantity: 2, price: 3500 }
    ],
    shippingAddress: {
      line1: 'Rua das Flores, 123',
      line2: 'Apto 45',
      city: 'São Paulo',
      state: 'SP',
      postal_code: '01234-567',
      country: 'BR'
    },
    createdAt: new Date('2024-01-15T10:30:00'),
    trackingCode: null
  },
  {
    id: '2',
    sessionId: 'cs_test_b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z6A7',
    customerName: 'Ana Santos',
    customerEmail: 'ana@email.com',
    customerPhone: '(11) 88888-5678',
    amount: 7500, // R$ 75,00
    status: 'paid',
    orderStatus: 'shipped',
    items: [
      { name: 'Brincos Gota Prata', quantity: 1, price: 4500 },
      { name: 'Anel Ajustável Rosa', quantity: 1, price: 3000 }
    ],
    shippingAddress: {
      line1: 'Av. Principal, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      postal_code: '20000-123',
      country: 'BR'
    },
    createdAt: new Date('2024-01-14T14:20:00'),
    trackingCode: 'BR123456789'
  },
  {
    id: '3',
    sessionId: 'cs_test_c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a7B8',
    customerName: 'Julia Costa',
    customerEmail: 'julia@email.com',
    customerPhone: '(11) 77777-9012',
    amount: 12000, // R$ 120,00
    status: 'paid',
    orderStatus: 'delivered',
    items: [
      { name: 'Conjunto Lua e Estrelas', quantity: 1, price: 12000 }
    ],
    shippingAddress: {
      line1: 'Rua do Sol, 789',
      city: 'Belo Horizonte',
      state: 'MG',
      postal_code: '30000-456',
      country: 'BR'
    },
    createdAt: new Date('2024-01-10T09:15:00'),
    trackingCode: 'BR987654321'
  }
];

const statusLabels = {
  preparing: { label: 'Preparando', color: 'bg-yellow-100 text-yellow-800' },
  shipped: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

const statusIcons = {
  preparing: Clock,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: AlertCircle
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtrar pedidos
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sessionId.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, orderStatus: newStatus }
        : order
    ));
  };

  const addTrackingCode = (orderId: string, trackingCode: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, trackingCode, orderStatus: 'shipped' }
        : order
    ));
  };

  const stats = {
    total: orders.length,
    preparing: orders.filter(o => o.orderStatus === 'preparing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Gerenciar Pedidos</h2>
        <p className="text-gray-600">
          Visualize e gerencie todos os pedidos da sua loja
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preparando</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.preparing}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {(stats.totalRevenue / 100).toFixed(2)}
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou ID da sessão..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status do pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="preparing">Preparando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const StatusIcon = statusIcons[order.orderStatus];
          const statusConfig = statusLabels[order.orderStatus];

          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{order.customerName}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {order.customerEmail}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {order.customerPhone}
                        </p>
                      </div>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Valor Total:</span>
                        <p className="text-lg font-bold text-green-600">
                          R$ {(order.amount / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Data do Pedido:</span>
                        <p>{order.createdAt.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Código de Rastreamento:</span>
                        <p className="font-mono text-sm">
                          {order.trackingCode || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="font-medium text-sm">Itens:</span>
                      <div className="space-y-1 mt-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.name} - R$ {(item.price / 100).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-fit">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    
                    {order.orderStatus === 'preparing' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Marcar como Enviado
                      </Button>
                    )}
                    
                    {order.orderStatus === 'shipped' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Entregue
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Quando você receber pedidos, eles aparecerão aqui.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Detalhes do Pedido</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cliente:</label>
                    <p>{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email:</label>
                    <p>{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefone:</label>
                    <p>{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total:</label>
                    <p className="font-bold">R$ {(selectedOrder.amount / 100).toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Endereço de Entrega:</label>
                  <div className="bg-gray-50 p-3 rounded mt-1">
                    <p>{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && (
                      <p>{selectedOrder.shippingAddress.line2}</p>
                    )}
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p>CEP: {selectedOrder.shippingAddress.postal_code}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Itens do Pedido:</label>
                  <div className="space-y-2 mt-1">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">R$ {(item.price / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Código de Rastreamento:</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Digite o código de rastreamento"
                      defaultValue={selectedOrder.trackingCode || ''}
                      id="tracking-input"
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('tracking-input') as HTMLInputElement;
                        if (input.value) {
                          addTrackingCode(selectedOrder.id, input.value);
                          setSelectedOrder(null);
                        }
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
