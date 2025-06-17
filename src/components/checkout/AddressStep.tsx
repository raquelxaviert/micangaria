'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function AddressStep() {
  const { data, updateShippingAddress, nextStep, prevStep } = useCheckout();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(data.shippingAddress);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'found' | 'invalid' | 'error'>('idle');

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) {
      return cleaned;
    }
    return cleaned.replace(/(\d{5})(\d{0,3})/, '$1-$2');
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    setFormData({ ...formData, zipCode: formatted });
    
    // Reset status ao digitar
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length < 8) {
      setCepStatus('idle');
    }
    
    // Auto-buscar quando CEP estiver completo
    if (cleanCep.length === 8) {
      handleCepLookup(cleanCep);
    }
  };

  const handleCepLookup = async (cep: string) => {
    if (cep.length !== 8) return;

    setIsLoadingCep(true);
    setCepStatus('loading');
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      
      if (data.erro) {
        setCepStatus('invalid');
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto e tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Preenchimento automático
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));

      setCepStatus('found');
      toast({
        title: "✅ Endereço encontrado!",
        description: `${data.localidade}/${data.uf} - ${data.bairro}`,
      });
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepStatus('error');
      toast({
        title: "Erro ao buscar CEP",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, '');
    if (cep.length === 8) {
      await handleCepLookup(cep);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const required = ['zipCode', 'street', 'number', 'neighborhood', 'city', 'state'];
    const missingFields = required.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios do endereço.",
        variant: "destructive",
      });
      return;
    }

    updateShippingAddress(formData);
    nextStep();
  };

  const getCepInputClassName = () => {
    const baseClass = "h-12 text-base pr-12 font-mono transition-all duration-300 ease-in-out";
    
    switch (cepStatus) {
      case 'loading':
        return `${baseClass} border-blue-400 bg-blue-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200`;
      case 'found':
        return `${baseClass} border-green-400 bg-green-50 focus:border-green-600 focus:ring-2 focus:ring-green-200`;
      case 'invalid':
      case 'error':
        return `${baseClass} border-red-400 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200`;
      default:
        return `${baseClass} focus:border-primary focus:ring-2 focus:ring-primary/20`;
    }
  };

  const getCepStatusIcon = () => {
    switch (cepStatus) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'found':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'invalid':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getCepHelperText = () => {
    switch (cepStatus) {
      case 'loading':
        return "Buscando endereço...";
      case 'found':
        return "Endereço encontrado e preenchido automaticamente";
      case 'invalid':
        return "CEP não encontrado. Verifique se está correto.";
      case 'error':
        return "Erro ao buscar CEP. Verifique sua conexão.";
      default:
        return "Digite o CEP para preenchimento automático do endereço";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="w-6 h-6" />
          Endereço de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CEP - Campo Principal */}
          <div className="space-y-3">
            <Label htmlFor="zipCode" className="text-base font-semibold text-gray-900">
              CEP <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                placeholder="00000-000"
                value={formData.zipCode}
                onChange={(e) => handleCepChange(e.target.value)}
                onBlur={handleCepBlur}
                maxLength={9}
                required
                className={getCepInputClassName()}
                autoComplete="postal-code"
                inputMode="numeric"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {getCepStatusIcon()}
              </div>
            </div>
            <p className={`text-sm transition-colors duration-200 ${
              cepStatus === 'invalid' || cepStatus === 'error' ? 'text-red-600' : 
              cepStatus === 'found' ? 'text-green-600' : 
              cepStatus === 'loading' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {getCepHelperText()}
            </p>
          </div>

          {/* Endereço e Número */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                Endereço <span className="text-red-500">*</span>
              </Label>
              <Input
                id="street"
                name="street"
                type="text"
                placeholder="Rua, Avenida, etc."
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
                className="h-12 text-base"
                autoComplete="address-line1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number" className="text-sm font-medium text-gray-700">
                Número <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                name="number"
                type="text"
                placeholder="123"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                required
                className="h-12 text-base"
                autoComplete="address-line2"
              />
            </div>
          </div>

          {/* Complemento */}
          <div className="space-y-2">
            <Label htmlFor="complement" className="text-sm font-medium text-gray-700">
              Complemento
            </Label>
            <Input
              id="complement"
              name="complement"
              type="text"
              placeholder="Apartamento, casa, bloco (opcional)"
              value={formData.complement}
              onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
              className="h-12 text-base"
              autoComplete="address-line3"
            />
          </div>

          {/* Bairro e Cidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
                Bairro <span className="text-red-500">*</span>
              </Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                type="text"
                placeholder="Nome do bairro"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                required
                className="h-12 text-base"
                autoComplete="address-level2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                Cidade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Nome da cidade"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="h-12 text-base"
                autoComplete="address-level1"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                Estado <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                name="state"
                type="text"
                placeholder="SP"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                maxLength={2}
                required
                className="h-12 text-base text-center font-mono"
                autoComplete="country"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Entrega Segura e Rápida</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Seus dados são protegidos e usados apenas para calcular o frete e realizar a entrega.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              className="flex-1 h-12 text-base font-medium border-2 hover:bg-gray-50"
            >
              ← Voltar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Calcular Frete →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
