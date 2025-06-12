'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, CreditCard, MapPin, Truck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';

// Dados de exemplo para CEP de origem (sua loja)
const ORIGEM = {
  postal_code: '01310100', // Av. Paulista, SP
  address: 'Avenida Paulista',
  number: '1000',
  district: 'Bela Vista',
  city: 'São Paulo',
  state_abbr: 'SP',
  country_id: 'BR'
};

interface CheckoutData {
  items: any[];
  customerInfo: any;
}

interface ShippingOption {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  delivery_time: number;
  company: {
    name: string;
    picture: string;
  };
}

export default function CheckoutWithShipping() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  const [zipCode, setZipCode] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    postal_code: '',
    address: '',
    number: '',
    district: '',
    city: '',
    state_abbr: '',
    country_id: 'BR'
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  // Carregar dados do carrinho
  useEffect(() => {
    const data = localStorage.getItem('checkout_data');
    if (data) {
      setCheckoutData(JSON.parse(data));
    } else {
      // Se não houver dados, redirecionar para o carrinho
      window.location.href = '/cart';
    }
  }, []);

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        postal_code: cleanCep,
        address: data.logradouro || 'Rua',
        number: '1',
        district: data.bairro || 'Centro',
        city: data.localidade,
        state_abbr: data.uf,
        country_id: 'BR'
      };
    } catch (error) {
      throw new Error('Erro ao buscar CEP');
    }
  };

  // Calcular frete
  const calculateShipping = async () => {
    if (!zipCode || zipCode.length < 8) {
      toast({
        title: "CEP inválido",
        description: "Por favor, informe um CEP válido.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      // Buscar endereço pelo CEP
      const address = await fetchAddressByCep(zipCode);
      setShippingAddress(address);

      // Preparar produtos para cálculo de frete
      const products = checkoutData?.items.map(item => ({
        id: item.productId,
        width: 20, // cm
        height: 5, // cm  
        length: 30, // cm
        weight: 0.3, // kg
        insurance_value: item.price,
        quantity: item.quantity,
        unitary_value: item.price
      })) || [];

      const shippingData = {
        from: ORIGEM,
        to: address,
        products: products
      };      // Chamar API de cálculo de frete
      console.log('🚚 Enviando dados para API:', shippingData);
      
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData),
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro da API:', errorText);
        throw new Error('Erro ao calcular frete');
      }      const shippingResult = await response.json();
      console.log('📦 Resposta da API:', shippingResult);
      
      // A API retorna { data: [...] }, então precisamos acessar o campo data
      const shippingOptions = shippingResult.data || shippingResult;
      console.log('🎯 Opções processadas:', shippingOptions);
      
      if (shippingOptions.length > 0) {
        setShippingOptions(shippingOptions);
        toast({
          title: "Frete calculado",
          description: `Encontradas ${shippingOptions.length} opções de entrega.`,
        });
      } else {
        throw new Error('Nenhuma opção de frete disponível');
      }
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      toast({
        title: "Erro no cálculo",
        description: error.message || "Não foi possível calcular o frete. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Selecionar opção de frete
  const selectShipping = (option: ShippingOption) => {
    setSelectedShipping(option);
    setCurrentStep('payment');
  };

  // Processar pagamento
  const processPayment = async () => {
    if (!selectedShipping || !checkoutData) return;

    setIsProcessingPayment(true);
    try {
      // Preparar dados para pagamento
      const items = checkoutData.items.map(item => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL'
      }));

      const paymentData = {
        items,
        shippingOption: selectedShipping,
        customerInfo: checkoutData.customerInfo,
        shippingAddress
      };

      // Criar preferência no Mercado Pago
      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }      const data = await response.json();
      console.log('🔗 Resposta do Mercado Pago:', data);
      
      // Use sandbox_init_point em desenvolvimento ou init_point em produção
      // Como estamos em sandbox, preferir sandbox_init_point
      const paymentUrl = data.sandbox_init_point || data.init_point;
      
      if (!paymentUrl) {
        console.error('❌ URLs disponíveis:', { 
          sandbox_init_point: data.sandbox_init_point, 
          init_point: data.init_point 
        });
        throw new Error('URL de pagamento não recebida');
      }
      
      console.log('🔗 Redirecionando para:', paymentUrl);
      
      // Redirecionar para o Mercado Pago
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const subtotal = checkoutData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.custom_price || selectedShipping.price) : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline text-primary mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">
            Complete os dados para finalizar seu pedido
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === 'shipping' ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              <Package className="w-4 h-4" />
              <span>Frete</span>
            </div>
            <div className="w-8 h-px bg-muted" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === 'payment' ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              <CreditCard className="w-4 h-4" />
              <span>Pagamento</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Etapa 1: Cálculo de Frete */}
            {currentStep === 'shipping' && (
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Calcular Frete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="zipcode">CEP de Entrega</Label>
                      <div className="flex gap-2">
                        <Input
                          id="zipcode"
                          placeholder="00000-000"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          maxLength={9}
                        />
                        <Button 
                          onClick={calculateShipping}
                          disabled={isCalculating}
                        >
                          {isCalculating ? 'Calculando...' : 'Calcular'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Opções de Frete */}
                {shippingOptions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Opções de Entrega
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => selectShipping(option)}
                        >                          <div className="flex items-center gap-3">                            <Image
                              src={option.company.picture || '/images/default-shipping.svg'}
                              alt={option.company.name}
                              width={40}
                              height={40}
                              className="rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/images/default-shipping.svg';
                              }}
                            />
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {option.delivery_time} dias úteis
                              </p>
                            </div>
                          </div>                          <div className="text-right">
                            <p className="font-bold">
                              {(() => {
                                const price = parseFloat(option.custom_price || option.price || '0');
                                return isNaN(price) || price === 0 ? 'Grátis' : `R$ ${price.toFixed(2)}`;
                              })()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Etapa 2: Pagamento */}
            {currentStep === 'payment' && selectedShipping && (
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Finalizar Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">                        <div className="flex items-center gap-3 mb-2">
                          <Image
                            src={selectedShipping.company.picture || '/images/default-shipping.png'}
                            alt={selectedShipping.company.name}
                            width={32}
                            height={32}
                            className="rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/images/default-shipping.png';
                            }}
                          />
                          <div>
                            <p className="font-medium">{selectedShipping.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedShipping.delivery_time} dias úteis
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Entrega em: {shippingAddress.city}, {shippingAddress.state_abbr}
                        </p>
                      </div>

                      <Button 
                        onClick={processPayment} 
                        disabled={isProcessingPayment}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {isProcessingPayment ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
                      </Button>

                      <button
                        onClick={() => setCurrentStep('shipping')}
                        className="text-primary hover:underline text-sm w-full text-center"
                      >
                        ← Alterar opção de frete
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar - Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Itens */}
                <div className="space-y-3">
                  {checkoutData.items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qtd: {item.quantity}
                        </p>
                        <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    <span>
                      {selectedShipping ? `R$ ${shippingCost.toFixed(2)}` : 'A calcular'}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Informações do Cliente */}
                <Separator />
                <div className="space-y-1">
                  <h4 className="font-medium">Dados do Cliente:</h4>
                  <p className="text-sm text-muted-foreground">{checkoutData.customerInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{checkoutData.customerInfo.email}</p>
                  {checkoutData.customerInfo.phone && (
                    <p className="text-sm text-muted-foreground">{checkoutData.customerInfo.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Voltar para carrinho */}
        <div className="mt-8 text-center">
          <Link href="/cart" className="text-primary hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao carrinho
          </Link>
        </div>
      </div>
    </div>
  );
}
