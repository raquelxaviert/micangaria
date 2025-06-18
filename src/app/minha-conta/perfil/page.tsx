'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
}

export default function EditarPerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: ''
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, authLoading, router]);

  const fetchUserProfile = async () => {
    try {
      const supabase = createClient();
      
      // Buscar dados do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      // Se a tabela não existe ou não há dados, usar dados básicos do usuário
      const userProfile = profileData || {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: ''
        }
      };

      setProfile(userProfile);
      setFormData({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        street: userProfile.address.street || '',
        city: userProfile.address.city || '',
        state: userProfile.address.state || '',
        postal_code: userProfile.address.postal_code || ''
      });

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Em caso de erro, usar dados básicos do usuário
      const userProfile = {
        id: user?.id || '',
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: ''
        }
      };
      
      setProfile(userProfile);
      setFormData({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        street: userProfile.address.street || '',
        city: userProfile.address.city || '',
        state: userProfile.address.state || '',
        postal_code: userProfile.address.postal_code || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const supabase = createClient();
      
      // Preparar dados para salvar
      const profileData = {
        id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code
        },
        updated_at: new Date().toISOString()
      };

      // Tentar atualizar perfil existente ou criar novo
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram salvos com sucesso!",
      });

      // Atualizar dados locais
      setProfile(prev => prev ? { ...prev, ...profileData } : null);

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando perfil...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/minha-conta">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-headline text-primary mb-2">Editar Perfil</h1>
          <p className="text-muted-foreground">
            Atualize suas informações pessoais e endereço
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email (somente leitura) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <Separator />

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CEP */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="postal_code">CEP</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                {/* Rua */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Nome da rua"
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Botões */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/minha-conta">
                  Cancelar
                </Link>
              </Button>
            </div>

            {/* Mensagem de sucesso */}
            {!saving && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  💡 Suas informações são usadas para melhorar sua experiência de compra
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 