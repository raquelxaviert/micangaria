'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Truck, Clock, Package, Loader2 } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckoutShipping } from './types';

export function ShippingStep() {
  const { data, updateShipping, nextStep, prevStep } = useCheckout();
  const { toast } = useToast();
  
  const [shippingOptions, setShippingOptions] = useState<CheckoutShipping[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<CheckoutShipping | null>(data.shipping || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateShipping();
  }, []);

  const calculateShipping = async () => {
    setIsLoading(true);
    
    try {
      // Simular cálculo de frete - substitua pela API real
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay da API
      
      const mockOptions: CheckoutShipping[] = [
        {
          id: 'pac',
          name: 'PAC',
          company: 'Correios',
          price: 15.90,
          deliveryTime: '5-8 dias úteis',
          description: 'Entrega econômica via Correios'
        },
        {
          id: 'sedex',
          name: 'SEDEX',
          company: 'Correios', 
          price: 25.50,
          deliveryTime: '2-3 dias úteis',
          description: 'Entrega expressa via Correios'
        },
        {
          id: 'jadlog',
          name: 'Econômico',
          company: 'Jadlog',
          price: 18.90,
          deliveryTime: '4-6 dias úteis',
          description: 'Entrega econômica via Jadlog'
        }
      ];

      // Frete grátis para pedidos acima de R$ 150
      if (data.subtotal >= 150) {
        mockOptions.forEach(option => {
          if (option.id === 'pac') {
            option.price = 0;
            option.name = 'PAC - GRÁTIS';
            option.description = 'Frete grátis para compras acima de R$ 150,00';
          }
        });
      }

      setShippingOptions(mockOptions);
      
      // Se não há opção selecionada, selecionar a primeira
      if (!selectedShipping && mockOptions.length > 0) {
        setSelectedShipping(mockOptions[0]);
      }
      
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      toast({
        title: "Erro ao calcular frete",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShipping = (shipping: CheckoutShipping) => {
    setSelectedShipping(shipping);
  };

  const handleContinue = () => {
    if (!selectedShipping) {
      toast({
        title: "Selecione o frete",
        description: "Escolha uma opção de entrega para continuar.",
        variant: "destructive",
      });
      return;
    }

    updateShipping(selectedShipping);
    nextStep();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Calculando Frete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Calculando as melhores opções de entrega para seu CEP...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Opções de Entrega
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Entrega para: {data.shippingAddress.city}, {data.shippingAddress.state} - {data.shippingAddress.zipCode}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {shippingOptions.map((option) => (
          <div
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedShipping?.id === option.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleSelectShipping(option)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedShipping?.id === option.id
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {selectedShipping?.id === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {option.company}
                    </Badge>
                    {option.price === 0 && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        GRÁTIS
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {option.deliveryTime}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">
                  {option.price === 0 ? 'GRÁTIS' : `R$ ${option.price.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>
        ))}

        <Separator />

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
            Voltar ao Endereço
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            Continuar para Pagamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
