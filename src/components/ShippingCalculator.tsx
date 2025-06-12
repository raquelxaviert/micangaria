'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Calculator, MapPin, Package } from 'lucide-react';
import { calculateShipping, validateZipCode, formatZipCode, type ShippingOption } from '@/lib/shipping';
import { Loader2 } from 'lucide-react';

interface ShippingCalculatorProps {
  products: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
    quantity: number;
  }>;
  onShippingSelect?: (option: ShippingOption) => void;
}

export default function ShippingCalculator({ products, onShippingSelect }: ShippingCalculatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);

  const handleZipCodeChange = (value: string) => {
    const formatted = formatZipCode(value);
    setZipCode(formatted);
    
    // Auto-buscar quando CEP estiver completo
    if (formatted.length === 9) {
      handleValidateZipCode(formatted);
    }
  };

  const handleValidateZipCode = async (cep: string) => {
    setLoading(true);
    setError('');
    
    try {
      const addressData = await validateZipCode(cep);
      
      if (addressData) {
        setAddress(addressData);
        await calculateShippingOptions(addressData);
      } else {
        setError('CEP não encontrado ou inválido');
      }
    } catch (err) {
      setError('Erro ao consultar CEP. Verifique e tente novamente.');
      setAddress(null);
      setShippingOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingOptions = async (toAddress: any) => {
    try {
      // Endereço da loja (configure com seu endereço)
      const fromAddress = {
        postal_code: '01310100', // Exemplo: Av. Paulista, SP
        address: 'Avenida Paulista',
        number: '1000',
        district: 'Bela Vista',
        city: 'São Paulo',
        state_abbr: 'SP',
        country_id: 'BR'
      };

      const shippingData = {
        from: fromAddress,
        to: toAddress,
        products: products.map(product => ({
          id: product.id,
          quantity: product.quantity,
          unitary_value: product.price,
          // Estimar dimensões baseado no tipo do produto
          height: 3,
          width: 25,
          length: 30,
          weight: 0.3
        }))
      };      const options = await calculateShipping(shippingData);
      
      // Ordenar por preço (mais barato primeiro)
      const sortedOptions = options.sort((a, b) => {
        const priceA = parseFloat(a.custom_price || a.price || '999999');
        const priceB = parseFloat(b.custom_price || b.price || '999999');
        return priceA - priceB;
      });
      
      setShippingOptions(sortedOptions);
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      setError('Erro ao calcular opções de frete');
    }
  };

  const handleSelectShipping = (option: ShippingOption) => {
    setSelectedOption(option);
    onShippingSelect?.(option);
  };
  const formatPrice = (price: string | number | undefined) => {
    if (!price && price !== 0) return 'R$ 0,00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'R$ 0,00';
    return numPrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDeliveryTime = (days: number) => {
    if (days === 1) return '1 dia útil';
    return `${days} dias úteis`;
  };

  return (
    <div className="space-y-6">
      {/* Calculadora de CEP */}
      <Card>        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-5 h-5" />
            Simular frete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="zipcode">CEP de Entrega</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="zipcode"
                value={zipCode}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className="flex-1"
              />              <Button 
                onClick={() => handleValidateZipCode(zipCode)}
                disabled={loading || zipCode.length < 9}
                size="sm"
                className="text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Simular'
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {address && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Endereço encontrado:</span>
              </div>
              <p className="text-sm text-green-600">
                {address.address}, {address.district}<br />
                {address.city} - {address.state_abbr}
              </p>
            </div>
          )}
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
          </CardHeader>          <CardContent className="space-y-3">
            {shippingOptions.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-3 md:p-4 cursor-pointer transition-all ${
                  selectedOption?.id === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectShipping(option)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={option.company.picture}
                        alt={option.company.name}
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                      />
                      <div>
                        <h4 className="font-medium text-sm md:text-base">{option.name}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {option.company.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDeliveryTime(option.delivery_time)}</span>
                      </div>
                      
                      {option.discount && parseFloat(option.discount) > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          {parseFloat(option.discount).toFixed(0)}% OFF
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span className="hidden sm:inline">Rastreamento incluído</span>
                        <span className="sm:hidden">Rastreamento</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg md:text-xl font-bold text-primary">
                      {formatPrice(option.custom_price || option.price)}
                    </div>
                    {option.discount && parseFloat(option.discount) > 0 && (
                      <div className="text-xs md:text-sm text-muted-foreground line-through">
                        {formatPrice(option.price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>        </Card>
      )}
    </div>
  );
}
