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
  const [currentStep, setCurrentStep] = useState(1);

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
            }),
          });          const shippingData = await shippingResponse.json();
          
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
            setSelectedShipping(defaultShipping[0]);
            return;
          }
            // Filtrar opções de frete e adicionar frete grátis para compras acima de R$ 300
          const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          const options = shippingData.map((option: any) => ({
            name: option.name || 'Frete Padrão',
            price: total >= 300 ? 0 : parseFloat(option.price || option.custom_price || '15.00'),
            deadline: `${option.delivery_time || option.custom_delivery_time || 5} dias úteis`,
          }));

          setShippingOptions(options);
          if (options.length > 0) {
            setSelectedShipping(options[0]);
          }        }
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
        }];
        setShippingOptions(defaultShipping);
        setSelectedShipping(defaultShipping[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipping) {
      toast({
        title: 'Selecione uma opção de frete',
        description: 'Por favor, escolha uma opção de entrega para continuar.',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(2);
  };

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = Number(selectedShipping?.price || 0);
  const finalTotal = total + shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <CheckoutProgress currentStep={currentStep} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 ? 'Dados de Entrega' : 'Pagamento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="h-12 text-base"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm font-medium">CPF *</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      required
                      value={customerInfo.cpf}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, cpf: e.target.value }))}
                      className="h-12 text-base"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-12 text-base"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div><div className="space-y-3">
                  <Label htmlFor="cep" className="text-base font-semibold">CEP *</Label>
                  <Input
                    id="cep"
                    name="cep"
                    type="text"
                    placeholder="00000-000"
                    required
                    value={shippingAddress.zipCode}
                    onChange={handleCepChange}
                    maxLength={9}
                    className="h-12 text-base font-mono"
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                  <p className="text-sm text-gray-500">
                    Digite o CEP para preenchimento automático do endereço
                  </p>
                </div>                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street" className="text-sm font-medium">Endereço *</Label>
                    <Input
                      id="street"
                      name="street"
                      type="text"
                      required
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                      className="h-12 text-base"
                      autoComplete="address-line1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number" className="text-sm font-medium">Número *</Label>
                    <Input
                      id="number"
                      name="number"
                      type="text"
                      required
                      value={shippingAddress.number}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, number: e.target.value }))}
                      className="h-12 text-base"
                      autoComplete="address-line2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement" className="text-sm font-medium">Complemento</Label>
                  <Input
                    id="complement"
                    name="complement"
                    type="text"
                    value={shippingAddress.complement}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, complement: e.target.value }))}
                    className="h-12 text-base"
                    autoComplete="address-line3"
                    placeholder="Apartamento, casa, bloco (opcional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood" className="text-sm font-medium">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      type="text"
                      required
                      value={shippingAddress.neighborhood}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="h-12 text-base"
                      autoComplete="address-level2"
                    />
                  </div>                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">Cidade *</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="h-12 text-base"
                      autoComplete="address-level1"
                    />
                  </div>
                </div>                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">Estado *</Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                      maxLength={2}
                      className="h-12 text-base text-center font-mono"
                      autoComplete="country"
                      placeholder="SP"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Entrega Segura e Rápida</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Seus dados são protegidos e usados apenas para calcular o frete e realizar a entrega.
                      </p>
                    </div>
                  </div>
                </div>

                {shippingOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label>Opções de Entrega</Label>
                    <div className="space-y-2">
                      {shippingOptions.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            selectedShipping === option ? 'border-primary' : 'border-border'
                          }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {option.deadline}
                              </p>
                            </div>                            <p className="font-medium">
                              {(option.price === 0 || Number(option.price) === 0) ? (
                                <span className="text-green-600">GRÁTIS</span>
                              ) : (
                                `R$ ${Number(option.price || 0).toFixed(2)}`
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Separator />
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>R$ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Continuar para Pagamento →
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-4">
                      <FastImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>                    <span>
                      {(selectedShipping?.price === 0 || Number(selectedShipping?.price || 0) === 0)
                        ? 'Grátis'
                        : `R$ ${Number(selectedShipping?.price || 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>R$ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <MercadoPagoButton
                  amount={finalTotal}
                  shippingOption={selectedShipping}
                  customerInfo={customerInfo}
                  shippingAddress={shippingAddress}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
