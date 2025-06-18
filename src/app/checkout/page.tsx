'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Truck, CreditCard } from 'lucide-react';
import { CartManager } from '@/lib/cart';
import { FastImage } from '@/components/ui/fast-image';
import MercadoPagoButton from '@/components/checkout/MercadoPagoButton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';

interface ShippingOption {
  name: string;
  price: number;
  deadline: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });
  const [shippingAddress, setShippingAddress] = useState({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calcular progresso do formulário
  const calculateFormProgress = () => {
    const requiredFields = [
      customerInfo.name,
      customerInfo.email,
      customerInfo.phone,
      customerInfo.cpf,
      shippingAddress.zipCode,
      shippingAddress.street,
      shippingAddress.number,
      shippingAddress.neighborhood,
      shippingAddress.city,
      shippingAddress.state,
    ];
    
    const filledFields = requiredFields.filter(field => field.trim() !== '').length;
    const totalFields = requiredFields.length;
    
    // Progresso base dos campos (70% do total)
    const baseProgress = (filledFields / totalFields) * 70;
    
    // Progresso do frete (30% do total)
    let shippingProgress = 0;
    if (shippingOptions.length > 0) {
      shippingProgress = 15; // 15% por ter opções disponíveis
      if (selectedShipping) {
        shippingProgress = 30; // 30% por ter selecionado uma opção
      }
    }
    
    return Math.min(baseProgress + shippingProgress, 100);
  };

  const formProgress = calculateFormProgress();

  useEffect(() => {
    const items = CartManager.getItems();
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive",
      });
      router.push('/cart');
      return;
    }
    setCartItems(items);
  }, []);

  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cep = value.replace(/\D/g, '');
    
    // Formatar CEP
    let formattedCep = cep;
    if (cep.length > 5) {
      formattedCep = cep.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    }
    
    setShippingAddress(prev => ({
      ...prev,
      zipCode: formattedCep,
    }));
    
    if (cep.length === 8) {
      try {
        // Buscar endereço pelo CEP
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setShippingAddress(prev => ({
            ...prev,
            zipCode: formattedCep,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));

          toast({
            title: "✅ Endereço encontrado!",
            description: `${data.localidade}/${data.uf} - ${data.bairro}`,
          });

          // Buscar opções de frete do Melhor Envio
          const shippingResponse = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: {
                postal_code: '01001000', // CEP da loja
              },
              to: {
                postal_code: cep,
              },
              products: cartItems.map(item => ({
                id: item.productId,
                width: 20, // Dimensões padrão para simulação
                height: 20,
                length: 20,
                weight: 1,
                insurance_value: item.price,
                quantity: item.quantity,
              })),
            }),          });

          const shippingData = await shippingResponse.json();
          
          // Verificar se a resposta da API é válida
          if (!shippingResponse.ok || !Array.isArray(shippingData)) {
            console.warn('Erro na API de frete, usando valores padrão');
            // Usar frete padrão como fallback
            const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const defaultShipping = [{
              name: 'Frete Padrão',
              price: total >= 300 ? 0 : 15.00,
              deadline: '5 dias úteis'
            }];
            setShippingOptions(defaultShipping);
            // Não selecionar automaticamente
            return;
          }

          // Processar todas as opções retornadas pela API
          const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          const options = shippingData
            .filter((option: any) => option.price !== null && option.price !== undefined)
            .map((option: any) => ({
              name: option.name || option.company?.name || 'Transportadora',
              company: option.company?.name || 'Correios',
              price: total >= 300 && option.name?.toLowerCase().includes('pac') ? 0 : parseFloat(option.price || option.custom_price || '0'),
              deadline: option.delivery_time ? `${option.delivery_time} dias úteis` : (option.custom_delivery_time || '5-10 dias úteis'),
              service_id: option.id,
              service_name: option.name,
            }))
            .sort((a: any, b: any) => a.price - b.price); // Ordenar por preço

          setShippingOptions(options);
          // Não selecionar automaticamente - deixar o usuário escolher
        }
      } catch (error) {
        console.error('Erro ao buscar CEP ou calcular frete:', error);
        toast({
          title: 'Erro ao buscar CEP',
          description: 'Não foi possível encontrar o endereço. Verifique o CEP e tente novamente.',
          variant: 'destructive',
        });
        
        // Ainda assim, oferece frete padrão
        const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const defaultShipping = [{
          name: 'Frete Padrão',
          price: total >= 300 ? 0 : 15.00,
          deadline: '5 dias úteis'
        }];        setShippingOptions(defaultShipping);
        // Não selecionar automaticamente
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipping) {
      toast({
        title: 'Selecione uma opção de frete',
        description: 'Por favor, escolha uma opção de entrega para continuar.',
        variant: 'destructive',
      });
      return;
    }

    // Redirecionar diretamente para o Mercado Pago
    try {
      setIsLoading(true);

      // Obter itens do carrinho
      const cartItems = CartManager.getItems().map((item: any) => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL'
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
          shippingOption: selectedShipping,
          customerInfo,
          shippingAddress,
          items: cartItems,
          userId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar preferência de pagamento');
      }

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de pagamento não encontrada');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível criar a preferência de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping ? Number(selectedShipping.price || 0) : 0;
  const finalTotal = total + shippingCost;  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0EB' }}>
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Coluna Principal - Formulário */}
            <div className="xl:col-span-8">
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    Dados de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Dados Pessoais */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome Completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-colors"
                        autoComplete="name"
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="cpf" className="text-sm font-semibold text-gray-700">CPF *</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        type="text"
                        required
                        value={customerInfo.cpf}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, cpf: e.target.value }))}
                        className="h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-colors"
                        autoComplete="off"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-colors"
                        autoComplete="email"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-lg transition-colors"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção de Endereço */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-sm">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Endereço de Entrega</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep" className="text-sm font-medium text-gray-700">CEP *</Label>
                      <Input
                        id="cep"
                        name="cep"
                        type="text"
                        placeholder="00000-000"
                        required
                        value={shippingAddress.zipCode}
                        onChange={handleCepChange}
                        maxLength={9}
                        className="h-12 text-sm sm:text-base font-mono border-2 border-gray-200 focus:border-primary rounded-lg transition-colors text-center"
                        autoComplete="postal-code"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="street" className="text-sm font-medium text-gray-700">Endereço *</Label>
                        <Input
                          id="street"
                          name="street"
                          type="text"
                          required
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                          className="h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-primary rounded-lg transition-colors"
                          autoComplete="address-line1"
                          placeholder="Rua, Avenida..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number" className="text-sm font-medium text-gray-700">Número *</Label>
                        <Input
                          id="number"
                          name="number"
                          type="text"
                          required
                          value={shippingAddress.number}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, number: e.target.value }))}
                          className="h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-primary rounded-lg transition-colors"
                          autoComplete="address-line2"
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complement" className="text-sm font-medium text-gray-700">Complemento</Label>
                      <Input
                        id="complement"
                        name="complement"
                        type="text"
                        value={shippingAddress.complement}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, complement: e.target.value }))}
                        className="h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-primary rounded-lg transition-colors"
                        autoComplete="address-line3"
                        placeholder="Apto, casa, bloco (opcional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          name="neighborhood"
                          type="text"
                          required
                          value={shippingAddress.neighborhood}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                          className="h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-primary rounded-lg transition-colors"
                          autoComplete="address-level2"
                          placeholder="Centro, Vila Nova..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">Cidade *</Label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-primary rounded-lg transition-colors"
                          autoComplete="address-level1"
                          placeholder="São Paulo"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">Estado *</Label>
                        <Input
                          id="state"
                          name="state"
                          type="text"
                          required
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                          maxLength={2}
                          className="h-12 text-sm sm:text-base text-center font-mono border-2 border-gray-200 focus:border-primary rounded-lg transition-colors"
                          autoComplete="country"
                          placeholder="SP"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Truck className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-base mb-2">Entrega Segura e Rápida</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Seus dados são protegidos e usados apenas para calcular o frete e realizar a entrega.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seção de Opções de Frete */}
                {shippingOptions.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">3</span>
                      </div>
                      Opções de Entrega
                    </h3>

                    <div className="space-y-3">
                      {shippingOptions.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            selectedShipping === option 
                              ? 'border-purple-400 bg-purple-50 shadow-lg ring-2 ring-purple-200' 
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                selectedShipping === option 
                                  ? 'bg-purple-100' 
                                  : 'bg-gray-100'
                              }`}>
                                <Truck className={`w-5 h-5 ${
                                  selectedShipping === option 
                                    ? 'text-purple-600' 
                                    : 'text-gray-600'
                                }`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-base text-gray-800 truncate">{option.name}</p>
                                <p className="text-sm text-gray-600">
                                  {option.deadline}
                                </p>
                              </div>
                            </div>
                            <div className="text-right sm:text-left">
                              <p className="font-bold text-lg">
                                {(option.price === 0 || Number(option.price) === 0) ? (
                                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                                    GRÁTIS
                                  </span>
                                ) : (
                                  <span className="text-gray-800">
                                    R$ {Number(option.price || 0).toFixed(2)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-gray-700">Subtotal</span>
                      <span className="font-semibold">R$ {total.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-gray-700">Frete</span>
                      <span className="font-semibold">
                        {!selectedShipping ? (
                          <span className="text-gray-500 text-sm">A calcular</span>
                        ) : (selectedShipping.price === 0 || Number(selectedShipping.price) === 0) ? (
                          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                            GRÁTIS
                          </span>
                        ) : (
                          `R$ ${Number(selectedShipping.price || 0).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary">
                        {!selectedShipping ? (
                          <>R$ {total.toFixed(2)} <span className="text-xs sm:text-sm text-gray-500">+ frete</span></>
                        ) : (
                          `R$ ${finalTotal.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #009EE3 0%, #0078A3 100%)',
                    color: 'white'
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processando...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="truncate">Ir para Pagamento</span>
                    </>
                  )}
                </Button>
                
                <div className="text-center mt-3">
                  <p className="text-xs text-gray-600">
                    Você será redirecionado para o Mercado Pago para concluir sua compra de forma segura
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
            </div>            {/* Coluna Lateral - Resumo do Pedido */}
            <div className="xl:col-span-4">
              <div className="sticky top-24">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex items-center space-x-3">
                          <FastImage
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-sm">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frete</span>
                        <span>
                          {!selectedShipping ? (
                            <span className="text-gray-500 text-sm">A calcular</span>
                          ) : (selectedShipping.price === 0 || Number(selectedShipping.price) === 0) ? (
                            <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                              GRÁTIS
                            </span>
                          ) : (
                            `R$ ${Number(selectedShipping.price || 0).toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">
                          {!selectedShipping ? (
                            <>R$ {total.toFixed(2)} <span className="text-xs text-gray-500">+ frete</span></>
                          ) : (
                            `R$ ${finalTotal.toFixed(2)}`
                          )}
                        </span>
                      </div>
                    </div>                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar fixo na parte inferior */}
      <CheckoutProgress currentStep={1} formProgress={formProgress} />
    </div>
  );
}
