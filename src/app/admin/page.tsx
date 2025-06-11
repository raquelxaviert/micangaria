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
import { MultiSelectInput } from '@/components/ui/MultiSelectInput';

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

  // Carregar produtos reais do Supabase
  const loadProductsFromSupabase = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data: supabaseProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('⚠️ Não foi possível carregar produtos do Supabase:', error);
        return;
      }
      
      if (supabaseProducts && supabaseProducts.length > 0) {        // Converter produtos do Supabase para o formato local
        const convertedProducts = supabaseProducts.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          compare_at_price: p.compare_at_price,
          cost_price: p.cost_price,
          imageUrl: p.image_url,
          imageHint: p.name.toLowerCase(),
          type: p.type,
          style: p.style,
          colors: p.colors || [],
          materials: p.materials || [],
          sizes: p.sizes || [],
          tags: p.tags || [],
          weight_grams: p.weight_grams,
          sku: p.sku,
          barcode: p.barcode,
          track_inventory: p.track_inventory,
          quantity: p.quantity,
          allow_backorder: p.allow_backorder,
          slug: p.slug,
          meta_title: p.meta_title,
          meta_description: p.meta_description,
          is_active: p.is_active,
          is_featured: p.is_featured,
          isNewArrival: p.is_new_arrival,
          isPromotion: p.is_on_sale,
          sale_start_date: p.sale_start_date,
          sale_end_date: p.sale_end_date,
          promotionDetails: p.promotion_text,
          search_keywords: p.search_keywords,
          vendor: p.vendor,
          collection: p.collection,
          notes: p.notes,
          gallery_urls: p.gallery_urls || []
        }));
        
        console.log('✅ Produtos carregados do Supabase:', convertedProducts.length);
        setProductList(convertedProducts);
      }
    } catch (error) {
      console.log('⚠️ Erro ao carregar produtos do Supabase:', error);
    }
  };

  // Verificar se já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = localStorage.getItem('micangariaAdminAuth');
      const authTime = localStorage.getItem('micangariaAdminTime');
      const currentTime = Date.now();
      
      // Sessão expira em 24 horas
      if (authStatus === 'true' && authTime && (currentTime - parseInt(authTime) < 24 * 60 * 60 * 1000)) {
        setIsAuthenticated(true);
        // Carregar produtos do Supabase quando autenticado
        await loadProductsFromSupabase();
      } else {
        // Limpar autenticação expirada
        localStorage.removeItem('micangariaAdminAuth');
        localStorage.removeItem('micangariaAdminTime');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);  const handleLogin = async () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('micangariaAdminAuth', 'true');
      localStorage.setItem('micangariaAdminTime', Date.now().toString());
      setLoginError('');
      setPassword(''); // Limpar senha
      
      // Carregar produtos do Supabase após login
      await loadProductsFromSupabase();
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
              loadProductsFromSupabase={loadProductsFromSupabase}
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
  setIsCreateDialogOpen,
  loadProductsFromSupabase
}: {
  products: Product[];
  setProducts: (products: Product[]) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  loadProductsFromSupabase: () => Promise<void>;
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
            </DialogHeader>            <ProductForm 
              onSave={(product) => {
                // Gerar ID temporal mais consistente (mas ainda será substituído pelo UUID do Supabase)
                const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                setProducts([...products, { ...product, id: tempId }]);
                setIsCreateDialogOpen(false);
                
                // Recarregar produtos do Supabase após criar
                setTimeout(() => {
                  loadProductsFromSupabase();
                }, 1000);
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
                <p className="text-sm text-muted-foreground capitalize">
                  {product.type} • {product.style}
                  {product.sku && (
                    <span className="ml-2 bg-muted px-2 py-0.5 rounded text-xs">
                      {product.sku}
                    </span>
                  )}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="text-xl font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </div>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <div className="text-sm text-muted-foreground line-through">
                    De: R$ {product.compare_at_price.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Tags rápidas */}
              <div className="flex flex-wrap gap-1">
                {product.colors?.slice(0, 3).map((color, idx) => (
                  <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                    {color}
                  </span>
                ))}
                {product.colors?.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
                )}
              </div>

              {/* Status do estoque */}
              {product.track_inventory && (
                <div className="text-xs text-muted-foreground">
                  Estoque: {product.quantity || 0} unidades
                </div>
              )}
              
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
                    </DialogHeader>                    <ProductForm 
                      product={product}
                      onSave={(updatedProduct) => {
                        setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
                        
                        // Recarregar produtos do Supabase após editar
                        setTimeout(() => {
                          loadProductsFromSupabase();
                        }, 1000);
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
}) {  const [formData, setFormData] = useState<Partial<any>>(product || {
    name: '',
    description: '',
    price: 0,
    compare_at_price: 0,
    cost_price: 0,
    type: 'colar',
    style: 'vintage',
    colors: [],
    materials: [],
    sizes: [],
    tags: [],
    weight_grams: 0,
    sku: '',
    barcode: '',
    track_inventory: false,
    quantity: 0,
    allow_backorder: false,
    slug: '',
    meta_title: '',
    meta_description: '',
    is_active: true,
    is_featured: false,
    is_new_arrival: false,
    is_on_sale: false,
    sale_start_date: '',
    sale_end_date: '',
    promotion_text: '',
    search_keywords: '',
    vendor: '',
    collection: '',
    notes: '',
    imageUrl: '',
    gallery_urls: []
  });

  // Sugestões para os campos de array
  const colorSuggestions = [
    'preto', 'branco', 'dourado', 'prata', 'rose gold', 'bronze', 'cobre',
    'vermelho', 'azul', 'verde', 'amarelo', 'roxo', 'rosa', 'laranja',
    'marrom', 'bege', 'cinza', 'turquesa', 'coral', 'vinho'
  ];

  const materialSuggestions = [
    'prata 925', 'ouro 18k', 'ouro folheado', 'aço inoxidável', 'bronze',
    'cobre', 'alumínio', 'couro', 'algodão', 'seda', 'linho', 'poliéster',
    'pérolas', 'cristais', 'pedras naturais', 'resina', 'madeira', 'bambu',
    'cerâmica', 'vidro', 'acrílico', 'miçangas', 'strass'
  ];

  const sizeSuggestions = [
    'PP', 'P', 'M', 'G', 'GG', 'XG', 'Único',
    '34', '35', '36', '37', '38', '39', '40', '41', '42',
    'Ajustável', '40cm', '45cm', '50cm', '60cm', '70cm'
  ];

  const tagSuggestions = [
    'vintage', 'boho', 'minimalista', 'elegante', 'casual', 'festa',
    'artesanal', 'handmade', 'exclusivo', 'limitado', 'sustentável',
    'reciclado', 'étnico', 'tribal', 'moderno', 'clássico', 'romântico',
    'rock', 'hippie', 'retrô', 'anos 80', 'anos 90', 'contemporâneo'
  ];

  const typeSuggestions = [
    'colar', 'brinco', 'pulseira', 'anel', 'bolsa', 'cinto', 'sandalia',
    'conjunto', 'broche', 'tornozeleira', 'tiara', 'presilha', 'carteira',
    'nécessaire', 'clutch'
  ];

  const styleSuggestions = [
    'vintage', 'retro', 'boho-vintage', 'anos-80', 'anos-90', 'moderno',
    'minimalista', 'maximalista', 'étnico', 'tribal', 'gótico', 'punk',
    'romântico', 'clássico', 'contemporâneo'
  ];

  const collectionSuggestions = [
    'Verão 2024', 'Inverno 2024', 'Primavera 2024', 'Outono 2024',
    'Edição Limitada', 'Coleção Especial', 'Básicos', 'Premium',
    'Artesanal', 'Sustentável', 'Vintage Collection', 'Modern Boho'
  ];

  const vendorSuggestions = [
    'RÜGE', 'Artesão Local', 'Fornecedor Nacional', 'Importado',
    'Produção Própria', 'Parceiro Exclusivo'
  ];
  
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
        }        // Conectar com Supabase
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          
          console.log('🔧 Verificando configuração Supabase...');
          console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
          console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
            const productData = {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            compare_at_price: formData.compare_at_price || null,
            cost_price: formData.cost_price || null,
            type: formData.type,
            style: formData.style,
            colors: formData.colors || [],
            materials: formData.materials || [],
            sizes: formData.sizes || [],
            weight_grams: formData.weight_grams || null,
            barcode: formData.barcode || null,
            track_inventory: formData.track_inventory || false,
            quantity: formData.quantity || 0,
            allow_backorder: formData.allow_backorder || false,
            slug: formData.slug || null,
            meta_title: formData.meta_title || null,
            meta_description: formData.meta_description || null,
            is_active: formData.is_active !== false,
            is_featured: formData.is_featured || false,
            is_new_arrival: formData.is_new_arrival || false,
            is_on_sale: formData.is_on_sale || false,
            sale_start_date: formData.sale_start_date || null,
            sale_end_date: formData.sale_end_date || null,
            promotion_text: formData.promotion_text || null,
            tags: formData.tags || [],
            search_keywords: formData.search_keywords || null,
            vendor: formData.vendor || null,
            collection: formData.collection || null,
            notes: formData.notes || null,
            image_url: finalImageUrl,
            gallery_urls: formData.gallery_urls || []
            // SKU será gerado automaticamente (#20xx)
          };
          
          console.log('📦 Dados do produto:', productData);
            if (product?.id) {
            // Verificar se o ID é um UUID válido
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
            
            if (isValidUUID) {
              // Atualizar produto existente no Supabase
              const { data, error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', product.id)
                .select();
                
              if (error) {
                console.error('❌ Erro detalhado (UPDATE):', error);
                throw error;
              }
              console.log('✅ Produto atualizado no Supabase:', data);
            } else {
              // ID não é UUID válido, criar novo produto
              console.log('⚠️ ID não é UUID válido, criando novo produto no Supabase');
              const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select();
                
              if (error) {
                console.error('❌ Erro detalhado (INSERT):', error);
                throw error;
              }
              console.log('✅ Novo produto criado no Supabase:', data);
            }
          } else {
            // Criar novo produto
            const { data, error } = await supabase
              .from('products')
              .insert([productData])
              .select();
              
            if (error) {
              console.error('❌ Erro detalhado (INSERT):', error);
              throw error;
            }
            console.log('✅ Produto criado no Supabase:', data);
          }} catch (supabaseError: any) {
          console.error('❌ Erro ao salvar no Supabase:', supabaseError);
          console.error('❌ Stack trace:', supabaseError?.stack);
          console.error('❌ Error details:', {
            message: supabaseError?.message,
            code: supabaseError?.code,
            details: supabaseError?.details,
            hint: supabaseError?.hint
          });
          
          // Mostrar erro mais detalhado para o usuário
          alert(`Erro ao salvar no Supabase: ${supabaseError?.message || 'Erro desconhecido'}`);
          // Continua com o fluxo local mesmo se Supabase falhar
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">📝 Informações Básicas</h3>
        
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
            <Label htmlFor="slug">URL Amigável (Slug)</Label>
            <Input
              id="slug"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="colar-lua-cheia"
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
      </div>

      {/* Preços e Financeiro */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">💰 Preços e Financeiro</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Preço de Venda (R$) *</Label>
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
          
          <div>
            <Label htmlFor="compare_at_price">Preço Original (R$)</Label>
            <Input
              id="compare_at_price"
              type="number"
              step="0.01"
              value={formData.compare_at_price || ''}
              onChange={(e) => setFormData({ ...formData, compare_at_price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="cost_price">Custo (R$)</Label>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              value={formData.cost_price || ''}
              onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Categorização */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">📂 Categorização</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo de Produto</Label>
            <Input
              id="type"
              value={formData.type || ''}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Digite ou selecione"
              list="type-suggestions"
            />
            <datalist id="type-suggestions">
              {typeSuggestions.map(type => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="style">Estilo</Label>
            <Input
              id="style"
              value={formData.style || ''}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              placeholder="Digite ou selecione"
              list="style-suggestions"
            />
            <datalist id="style-suggestions">
              {styleSuggestions.map(style => (
                <option key={style} value={style} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vendor">Fornecedor/Marca</Label>
            <Input
              id="vendor"
              value={formData.vendor || ''}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="Digite ou selecione"
              list="vendor-suggestions"
            />
            <datalist id="vendor-suggestions">
              {vendorSuggestions.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="collection">Coleção</Label>
            <Input
              id="collection"
              value={formData.collection || ''}
              onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
              placeholder="Digite ou selecione"
              list="collection-suggestions"
            />
            <datalist id="collection-suggestions">
              {collectionSuggestions.map(collection => (
                <option key={collection} value={collection} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Características do Produto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">🎨 Características</h3>
        
        <div className="space-y-4">
          <MultiSelectInput
            label="Cores"
            value={formData.colors || []}
            onChange={(colors) => setFormData({ ...formData, colors })}
            suggestions={colorSuggestions}
            placeholder="Digite uma cor e pressione Enter"
            maxItems={8}
          />

          <MultiSelectInput
            label="Materiais"
            value={formData.materials || []}
            onChange={(materials) => setFormData({ ...formData, materials })}
            suggestions={materialSuggestions}
            placeholder="Digite um material e pressione Enter"
            maxItems={10}
          />

          <MultiSelectInput
            label="Tamanhos"
            value={formData.sizes || []}
            onChange={(sizes) => setFormData({ ...formData, sizes })}
            suggestions={sizeSuggestions}
            placeholder="Digite um tamanho e pressione Enter"
            maxItems={6}
          />

          <MultiSelectInput
            label="Tags/Palavras-chave"
            value={formData.tags || []}
            onChange={(tags) => setFormData({ ...formData, tags })}
            suggestions={tagSuggestions}
            placeholder="Digite uma tag e pressione Enter"
            maxItems={12}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight_grams">Peso (gramas)</Label>
            <Input
              id="weight_grams"
              type="number"
              value={formData.weight_grams || ''}
              onChange={(e) => setFormData({ ...formData, weight_grams: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="search_keywords">Palavras-chave para busca</Label>
            <Input
              id="search_keywords"
              value={formData.search_keywords || ''}
              onChange={(e) => setFormData({ ...formData, search_keywords: e.target.value })}
              placeholder="colar vintage dourado bohemio"
            />
          </div>
        </div>
      </div>

      {/* Imagens */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">🖼️ Imagens</h3>
        
        <div>
          <Label htmlFor="imageUrl">Imagem Principal</Label>
          <ImageUploadTemp
            currentImage={imageData.url}
            onImageChange={(data) => {
              setImageData(data);
              setFormData({ ...formData, imageUrl: data.url });
            }}
          />
        </div>
      </div>

      {/* Inventário */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">📦 Inventário</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sku">SKU (Código)</Label>
            <Input
              id="sku"
              value={formData.sku || ''}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Será gerado automaticamente"
              disabled
            />
          </div>

          <div>
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              value={formData.barcode || ''}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="7891234567890"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantidade em Estoque</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="track_inventory"
              checked={formData.track_inventory || false}
              onCheckedChange={(checked) => setFormData({ ...formData, track_inventory: !!checked })}
            />
            <Label htmlFor="track_inventory">Controlar Estoque</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow_backorder"
              checked={formData.allow_backorder || false}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_backorder: !!checked })}
            />
            <Label htmlFor="allow_backorder">Permitir Encomenda</Label>
          </div>
        </div>
      </div>

      {/* Status e Promoções */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">🏷️ Status e Promoções</h3>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active !== false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
            />
            <Label htmlFor="is_active">Produto Ativo</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
            />
            <Label htmlFor="is_featured">Produto em Destaque</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_new_arrival"
              checked={formData.is_new_arrival || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_new_arrival: !!checked })}
            />
            <Label htmlFor="is_new_arrival">Produto Novo</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_on_sale"
              checked={formData.is_on_sale || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_on_sale: !!checked })}
            />
            <Label htmlFor="is_on_sale">Em Promoção</Label>
          </div>
        </div>

        {formData.is_on_sale && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="promotion_text">Texto da Promoção</Label>
              <Input
                id="promotion_text"
                value={formData.promotion_text || ''}
                onChange={(e) => setFormData({ ...formData, promotion_text: e.target.value })}
                placeholder="Ex: 20% OFF por tempo limitado"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sale_start_date">Data de Início</Label>
                <Input
                  id="sale_start_date"
                  type="datetime-local"
                  value={formData.sale_start_date || ''}
                  onChange={(e) => setFormData({ ...formData, sale_start_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="sale_end_date">Data de Fim</Label>
                <Input
                  id="sale_end_date"
                  type="datetime-local"
                  value={formData.sale_end_date || ''}
                  onChange={(e) => setFormData({ ...formData, sale_end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">🔍 SEO</h3>
        
        <div>
          <Label htmlFor="meta_title">Título SEO</Label>
          <Input
            id="meta_title"
            value={formData.meta_title || ''}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            placeholder="Título para mecanismos de busca"
            maxLength={60}
          />
        </div>

        <div>
          <Label htmlFor="meta_description">Descrição SEO</Label>
          <Textarea
            id="meta_description"
            value={formData.meta_description || ''}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            placeholder="Descrição para mecanismos de busca"
            maxLength={160}
            rows={2}
          />
        </div>
      </div>

      {/* Notas Internas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">📝 Notas Internas</h3>
        
        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Anotações internas sobre o produto..."
            rows={3}
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 pt-6 border-t">
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
