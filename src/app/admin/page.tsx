'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Save, Upload, Eye, ShoppingBag, Settings, BarChart3, Package, Users } from 'lucide-react';
import { Product, products } from '@/lib/placeholder-data';
import OrdersManagement from '@/components/OrdersManagement';
import ImageUploadTemp from '@/components/ImageUploadTemp';
import { uploadImageToSupabase } from '@/lib/uploadUtils';
import Image from 'next/image';

// Simulação de autenticação simples
const ADMIN_PASSWORD = 'micangaria2024'; // Em produção, usar sistema de auth real

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [productList, setProductList] = useState<Product[]>(products);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se já está autenticado
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('micangariaAdminAuth');
      const authTime = localStorage.getItem('micangariaAdminTime');
      const currentTime = Date.now();
      
      // Sessão expira em 24 horas
      if (authStatus === 'true' && authTime && (currentTime - parseInt(authTime) < 24 * 60 * 60 * 1000)) {
        setIsAuthenticated(true);
      } else {
        // Limpar autenticação expirada
        localStorage.removeItem('micangariaAdminAuth');
        localStorage.removeItem('micangariaAdminTime');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('micangariaAdminAuth', 'true');
      localStorage.setItem('micangariaAdminTime', Date.now().toString());
      setLoginError('');
      setPassword(''); // Limpar senha
    } else {
      setLoginError('Senha incorreta. Tente novamente.');
      setPassword(''); // Limpar campo para nova tentativa
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('micangariaAdminAuth');
    localStorage.removeItem('micangariaAdminTime');
    setPassword('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline text-primary">
              🔐 Área Administrativa
            </CardTitle>
            <p className="text-muted-foreground">
              Acesso restrito ao proprietário da RÜGE
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
            
            <div className="text-xs text-muted-foreground text-center mt-4">
              💡 Esta é uma demo. Senha: <code className="bg-muted px-1 rounded">micangaria2024</code>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-headline text-primary">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Gerencie seus produtos e configurações</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-5">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>          <TabsContent value="products">
            <ProductManagement 
              products={productList} 
              setProducts={setProductList}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              isCreateDialogOpen={isCreateDialogOpen}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard products={productList} />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente de Gerenciamento de Produtos
function ProductManagement({ 
  products, 
  setProducts, 
  editingProduct, 
  setEditingProduct,
  isCreateDialogOpen,
  setIsCreateDialogOpen 
}: {
  products: Product[];
  setProducts: (products: Product[]) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da seção */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Gerenciar Produtos</h2>
          <p className="text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <ProductForm 
              onSave={(product) => {
                setProducts([...products, { ...product, id: Date.now().toString() }]);
                setIsCreateDialogOpen(false);
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {product.isNewArrival && (
                  <Badge className="bg-accent text-accent-foreground">NOVO</Badge>
                )}
                {product.isPromotion && (
                  <Badge className="bg-destructive text-destructive-foreground">OFERTA</Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{product.type} • {product.style}</p>
              </div>
              
              <div className="text-xl font-bold text-primary">
                R$ {product.price.toFixed(2)}
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Produto</DialogTitle>
                    </DialogHeader>
                    <ProductForm 
                      product={product}
                      onSave={(updatedProduct) => {
                        setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
                      }}
                    />
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Formulário de Produto (Criar/Editar)
function ProductForm({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product?: Product; 
  onSave: (product: Product) => void; 
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '',
    description: '',
    price: 0,
    type: 'colar',
    style: 'boho',
    colors: [],
    imageUrl: '',
    isNewArrival: false,
    isPromotion: false,
    promotionDetails: '',
    id: '' // SKU será gerado automaticamente pelo Supabase (#20xx)
  });
  
  // Estado para gerenciar upload de imagem
  const [imageData, setImageData] = useState<{ url: string; file?: File; isTemp?: boolean }>({ 
    url: product?.imageUrl || '' 
  });
  const [isUploading, setIsUploading] = useState(false);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.description && formData.price) {
      setIsUploading(true);
      
      try {
        let finalImageUrl = formData.imageUrl || '';
        
        // Se há arquivo temporário, fazer upload primeiro
        if (imageData.file && imageData.isTemp) {
          console.log('📤 Fazendo upload da imagem...');
          const uploadResult = await uploadImageToSupabase(imageData.file);
          
          if (uploadResult.success && uploadResult.url) {
            finalImageUrl = uploadResult.url;
            console.log('✅ Imagem enviada com sucesso:', finalImageUrl);
          } else {
            // Se upload falhou, usar imagem local como fallback
            finalImageUrl = `/products/${imageData.file.name}`;
            console.log('⚠️ Usando fallback local:', finalImageUrl);
            alert(`Aviso: Upload da imagem falhou (${uploadResult.error}). Usando imagem local como alternativa.`);
          }
        } else if (imageData.url && !imageData.isTemp) {
          // Usar imagem local selecionada
          finalImageUrl = imageData.url;
        }
        
        // Em produção, conectar com Supabase
        if (process.env.NODE_ENV === 'production') {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          
          const productData = {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            type: formData.type,
            style: formData.style,
            colors: formData.colors || [],
            image_url: finalImageUrl,
            is_new_arrival: formData.isNewArrival || false,
            is_on_sale: formData.isPromotion || false,
            promotion_text: formData.promotionDetails || null,
            is_active: true
            // SKU será gerado automaticamente (#20xx)
          };
          
          if (product?.id) {
            // Atualizar produto existente
            const { error } = await supabase
              .from('products')
              .update(productData)
              .eq('id', product.id);
              
            if (error) throw error;
          } else {
            // Criar novo produto
            const { error } = await supabase
              .from('products')
              .insert([productData]);
              
            if (error) throw error;
          }
        }
          // Para desenvolvimento, usar dados mock com imagem final
        onSave({ ...formData, imageUrl: finalImageUrl } as Product);
        onCancel?.();
      } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Erro ao salvar produto. Tente novamente.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Colar Lua Cheia"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o produto, materiais, inspiração..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Categoria</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="colar">Colar</SelectItem>
              <SelectItem value="brinco">Brincos</SelectItem>
              <SelectItem value="pulseira">Pulseira</SelectItem>
              <SelectItem value="anel">Anel</SelectItem>
              <SelectItem value="bolsa">Bolsa</SelectItem>
              <SelectItem value="cinto">Cinto</SelectItem>
              <SelectItem value="sandalia">Sandália</SelectItem>
              <SelectItem value="conjunto">Conjunto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="style">Estilo</Label>
          <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boho">Boho</SelectItem>
              <SelectItem value="indígena">Indígena</SelectItem>
              <SelectItem value="minimalista">Minimalista</SelectItem>
              <SelectItem value="étnico">Étnico</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>      <div>
        <Label htmlFor="imageUrl">Imagem do Produto</Label>
        <ImageUploadTemp
          currentImage={imageData.url}
          onImageChange={(data) => {
            setImageData(data);
            setFormData({ ...formData, imageUrl: data.url });
          }}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isNewArrival"
            checked={formData.isNewArrival || false}
            onCheckedChange={(checked) => setFormData({ ...formData, isNewArrival: !!checked })}
          />
          <Label htmlFor="isNewArrival">Produto Novo</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPromotion"
            checked={formData.isPromotion || false}
            onCheckedChange={(checked) => setFormData({ ...formData, isPromotion: !!checked })}
          />
          <Label htmlFor="isPromotion">Em Promoção</Label>
        </div>
      </div>

      {formData.isPromotion && (
        <div>
          <Label htmlFor="promotionDetails">Detalhes da Promoção</Label>
          <Input
            id="promotionDetails"
            value={formData.promotionDetails || ''}
            onChange={(e) => setFormData({ ...formData, promotionDetails: e.target.value })}
            placeholder="Ex: 20% OFF por tempo limitado"
          />
        </div>
      )}      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isUploading}>
          <Save className="w-4 h-4 mr-2" />
          {isUploading ? 'Salvando...' : 'Salvar Produto'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

// Componentes de placeholder para outras abas
function AnalyticsDashboard({ products }: { products: Product[] }) {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const newProducts = products.filter(p => p.isNewArrival).length;
  const promotions = products.filter(p => p.isPromotion).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Relatórios e Análises</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Novos Produtos</p>
                <p className="text-2xl font-bold">{newProducts}</p>
              </div>
              <Plus className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Promoção</p>
                <p className="text-2xl font-bold">{promotions}</p>
              </div>
              <Badge className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📊 Resumo por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['colar', 'brinco', 'pulseira', 'anel', 'bolsa'].map(type => {
              const count = products.filter(p => p.type === type).length;
              return (
                <div key={type} className="flex justify-between items-center">
                  <span className="capitalize">{type}</span>
                  <Badge variant="secondary">{count} produtos</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gerenciar Clientes</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
          <p className="text-muted-foreground">
            Funcionalidade de gerenciamento de clientes será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SiteSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Configurações do Site</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
          <p className="text-muted-foreground">
            Configurações gerais do site serão implementadas em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
