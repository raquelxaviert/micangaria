'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Shield, LogIn } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export function CustomerStep() {
  const { data, updateCustomer, nextStep } = useCheckout();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState(data.customer);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Preencher dados automaticamente quando usuário está logado
  useEffect(() => {
    if (user && user.email) {
      const userData = {
        name: user.user_metadata?.full_name || formData.name || '',
        email: user.email,
        phone: user.user_metadata?.phone || formData.phone || ''
      };
      setFormData(userData);
      updateCustomer(userData);
    }
  }, [user, updateCustomer]);

  // Se não está autenticado, mostrar tela de login
  if (!authLoading && !user) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              Acesso Necessário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                <LogIn className="w-10 h-10 text-amber-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Entre na sua conta
                </h3>
                <p className="text-gray-600 mb-4">
                  Para finalizar sua compra, você precisa estar logado. Isso nos permite:
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <ul className="text-sm space-y-2 text-amber-800">
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Proteger seus dados pessoais
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar atualizações do pedido
                  </li>
                  <li className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Salvar seu histórico de compras
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar ou Criar Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab="login"
        />
      </>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Verificando acesso...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e e-mail são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    updateCustomer(formData);
    
    toast({
      title: "Dados confirmados",
      description: "Prosseguindo para endereço de entrega.",
    });
    
    nextStep();
  };

  // Formulário para usuário autenticado
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Dados Pessoais
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Shield className="w-4 h-4" />
          Logado como: {user?.email}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled // E-mail do usuário logado não pode ser alterado
                className="bg-gray-50 text-gray-600"
                required
              />
              <p className="text-xs text-gray-500">
                E-mail da sua conta. Para alterar, faça logout e entre com outro e-mail.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Checkout Seguro</h4>
                <p className="text-sm text-green-700 mt-1">
                  Seus dados estão protegidos e o histórico do pedido será salvo na sua conta.
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Continuar para Endereço
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
