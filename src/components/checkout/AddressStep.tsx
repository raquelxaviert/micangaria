'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function AddressStep() {
  const { data, updateShippingAddress, nextStep, prevStep } = useCheckout();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(data.shippingAddress);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleCepBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));

      toast({
        title: "Endereço encontrado!",
        description: "Dados preenchidos automaticamente.",
      });
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente ou preencha manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCep(false);
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

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Endereço de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP *</Label>
              <div className="relative">
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="00000-000"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: formatCep(e.target.value) })}
                  onBlur={handleCepBlur}
                  maxLength={9}
                  required
                />
                {isLoadingCep && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                type="text"
                placeholder="123"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Endereço *</Label>
            <Input
              id="street"
              type="text"
              placeholder="Rua, Avenida, etc."
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              type="text"
              placeholder="Apartamento, casa, bloco, etc."
              value={formData.complement}
              onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                type="text"
                placeholder="Nome do bairro"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                type="text"
                placeholder="Nome da cidade"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              type="text"
              placeholder="SP"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              maxLength={2}
              required
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Entrega Segura</h4>
                <p className="text-sm text-green-700 mt-1">
                  Suas informações de endereço são criptografadas e usadas apenas para entrega.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
              Voltar
            </Button>
            <Button type="submit" className="flex-1">
              Calcular Frete
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
