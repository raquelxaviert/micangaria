'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Plus, Edit, Trash2, Save, Upload, Eye, ShoppingBag, Settings, BarChart3, Package, Users, Layers3, AlertCircle, X } from 'lucide-react';
import { Product, products } from '@/lib/placeholder-data';
import OrdersManagement from '@/components/OrdersManagement';
import ImageUploadTemp from '@/components/ImageUploadTemp';
import { MultiImageUpload } from '@/components/ui/MultiImageUploadDragDropFixed';
import { uploadImageToSupabase } from '@/lib/uploadUtils';
import GoogleDrivePicker from '@/components/GoogleDrivePicker';
import Image from 'next/image';
import { MultiSelectInput } from '@/components/ui/MultiSelectInput';
import { SelectInput } from '@/components/ui/SelectInput';
import SmartSelect from '@/components/SmartSelect';
import useProductMetadata from '@/hooks/useProductMetadata';
import { createClient } from '@/lib/supabase/client';

// Simulação de autenticação simples
const ADMIN_PASSWORD = 'micangaria2024'; // Em produção, usar sistema de auth real

// Criar cliente Supabase
const supabase = createClient();

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
          search_keywords: p.search_keywords,          vendor: p.vendor,
          collection: p.collection,
          notes: p.notes,
          care_instructions: p.care_instructions,
          gallery_urls: p.gallery_urls || [],
            // Badge display configuration
          show_colors_badge: p.show_colors_badge,
          show_materials_badge: p.show_materials_badge,
          show_sizes_badge: p.show_sizes_badge
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
        </div>        <Tabs defaultValue="products" className="space-y-6">          {/* Mobile Layout */}
          <div className="sm:hidden">
            <TabsList className="grid grid-cols-3 w-full gap-1 h-auto p-1">
              <TabsTrigger value="products" className="h-16 flex flex-col items-center justify-center gap-1 text-xs px-1">
                <Package className="w-4 h-4" />
                <span>Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="collections" className="h-16 flex flex-col items-center justify-center gap-1 text-xs px-1">
                <Layers3 className="w-4 h-4" />
                <span>Coleções</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="h-16 flex flex-col items-center justify-center gap-1 text-xs px-1">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="h-16 flex flex-col items-center justify-center gap-1 text-xs px-1">
                <BarChart3 className="w-4 h-4" />
                <span>Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="h-16 flex flex-col items-center justify-center gap-1 text-xs px-1">
                <Users className="w-4 h-4" />
                <span>Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="h-16 flex flex-col items-center justify-center gap-1 text-xs px-1">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block">
            <TabsList className="grid grid-cols-6 gap-2">
              <TabsTrigger value="products" className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                <span>Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center justify-center gap-2">
                <Layers3 className="w-4 h-4" />
                <span>Coleções</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span>Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="products">
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

          <TabsContent value="collections">
            <CollectionsManagement products={productList} />
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
  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        // Verificar se é um UUID válido do Supabase
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);
        
        if (isValidUUID) {
          // Deletar do Supabase
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
            
          if (error) {
            console.error('❌ Erro ao deletar produto do Supabase:', error);
            alert(`Erro ao deletar produto do banco de dados: ${error.message}`);
            return;
          }
          
          console.log('✅ Produto deletado do Supabase:', productId);
        }
        
        // Remover da lista local
        setProducts(products.filter(p => p.id !== productId));
        
        // Recarregar produtos do Supabase após deletar
        if (isValidUUID) {
          setTimeout(() => {
            loadProductsFromSupabase();
          }, 500);
        }
        
      } catch (error) {
        console.error('❌ Erro ao deletar produto:', error);
        alert('Erro ao deletar produto. Tente novamente.');
      }
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
          </DialogTrigger>          <DialogContent
              className="fixed inset-0 m-auto w-[95vw] max-h-[90vh] overflow-y-auto sm:inset-auto sm:left-1/2 sm:top-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-auto sm:max-w-2xl"
            >
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
            <ProductForm 
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
          <Card key={product.id} className="overflow-hidden">            <div className="aspect-square relative">
              {(product.gallery_urls && product.gallery_urls.length > 0) ? (
                <Image
                  src={product.gallery_urls[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (product.imageUrl || product.image_url) ? (
                <Image
                  src={product.imageUrl || product.image_url || '/products/placeholder.jpg'}
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
              
              <div className="flex gap-2">                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="fixed inset-0 m-auto w-[95vw] max-h-[90vh] overflow-y-auto sm:inset-auto sm:left-1/2 sm:top-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-auto sm:max-w-2xl"
                  >
                    <DialogHeader>
                      <DialogTitle>Editar Produto</DialogTitle>
                    </DialogHeader>
                    <ProductForm 
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
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 hover:border-destructive transition-colors"
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
}) {  // Hook para metadados de produtos (tipos e estilos inteligentes)
  const { 
    loading: metadataLoading, 
    getAllTypes, 
    getAllStyles, 
    addCustomType, 
    addCustomStyle 
  } = useProductMetadata();  const [formData, setFormData] = useState<Partial<any>>(() => {
    const defaultData = {
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
      care_instructions: '',
      imageUrl: '',
      gallery_urls: [],
      alt_text: '',
      
      // Badge display configuration - garantir que sempre existe
      show_colors_badge: true,
      show_materials_badge: true,
      show_sizes_badge: true
    };

    // Se há um produto para edição, mesclar com os dados padrão
    if (product) {
      return {
        ...defaultData,
        ...product,
        // Garantir que os badges sempre tenham valores boolean
        show_colors_badge: product.show_colors_badge !== false,
        show_materials_badge: product.show_materials_badge !== false,
        show_sizes_badge: product.show_sizes_badge !== false,
        // Garantir que arrays sempre existam
        colors: product.colors || [],
        materials: product.materials || [],
        sizes: product.sizes || [],
        tags: product.tags || [],
        gallery_urls: product.gallery_urls || []
      };
    }    return defaultData;
  });

  // Atualizar formData quando product muda (para casos de reutilização do componente)
  useEffect(() => {
    if (product) {
      const defaultData = {
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
        care_instructions: '',
        imageUrl: '',
        gallery_urls: [],
        alt_text: '',
        show_colors_badge: true,
        show_materials_badge: true,
        show_sizes_badge: true
      };

      setFormData({
        ...defaultData,
        ...product,
        show_colors_badge: product.show_colors_badge !== false,
        show_materials_badge: product.show_materials_badge !== false,
        show_sizes_badge: product.show_sizes_badge !== false,
        colors: product.colors || [],
        materials: product.materials || [],
        sizes: product.sizes || [],
        tags: product.tags || [],
        gallery_urls: product.gallery_urls || []
      });
    }
  }, [product?.id]); // Apenas quando o ID do produto muda

  // Função estável para atualizar imagens
  const handleImagesChange = useCallback((images: string[]) => {
    const [primaryImage, ...galleryImages] = images;
    setFormData(prev => ({ 
      ...prev, 
      imageUrl: primaryImage || '',
      gallery_urls: galleryImages
    }));  }, []);

  // Funções estáveis para checkboxes (evitar loop infinito)
  const handleTrackInventoryChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, track_inventory: checked }));
  }, []);

  const handleAllowBackorderChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, allow_backorder: checked }));
  }, []);

  const handleIsActiveChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  }, []);

  const handleIsFeaturedChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, is_featured: checked }));
  }, []);

  const handleIsNewArrivalChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, is_new_arrival: checked }));
  }, []);
  const handleIsOnSaleChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, is_on_sale: checked }));
  }, []);

  // Badge configuration checkboxes
  const handleShowColorsBadgeChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, show_colors_badge: checked }));
  }, []);

  const handleShowMaterialsBadgeChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, show_materials_badge: checked }));
  }, []);

  const handleShowSizesBadgeChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, show_sizes_badge: checked }));
  }, []);

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
        let finalImageStoragePath = '';
        
        // Se há arquivo temporário, fazer upload primeiro
        if (imageData.file && imageData.isTemp) {
          console.log('📤 Fazendo upload da imagem principal...');
          const uploadResult = await uploadImageToSupabase(imageData.file);
          
          if (uploadResult.success && uploadResult.url) {
            finalImageUrl = uploadResult.url;
            finalImageStoragePath = uploadResult.path || '';
            console.log('✅ Imagem principal enviada com sucesso:', finalImageUrl);
            console.log('📁 Path de storage:', finalImageStoragePath);
          } else {
            // Se upload falhou, usar imagem local como fallback
            finalImageUrl = `/products/${imageData.file.name}`;
            console.log('⚠️ Usando fallback local:', finalImageUrl);
            alert(`Aviso: Upload da imagem falhou (${uploadResult.error}). Usando imagem local como alternativa.`);
          }
        } else if (imageData.url && !imageData.isTemp) {
          // Usar imagem local selecionada
          finalImageUrl = imageData.url;
          // Extrair storage path se for URL do Supabase
          if (imageData.url.includes('supabase') && imageData.url.includes('product-images')) {
            const match = imageData.url.match(/\/product-images\/(.+)$/);
            finalImageStoragePath = match ? match[1] : '';
          }
        }

        // Processar gallery_urls - verificar se há URLs blob que precisam ser convertidas
        let finalGalleryUrls = formData.gallery_urls || [];
        let finalGalleryStoragePaths: string[] = [];
        
        // Filtrar apenas URLs blob que precisam ser processadas
        const blobUrls = finalGalleryUrls.filter((url: string) => url.startsWith('blob:'));
        
        if (blobUrls.length > 0) {
          console.log('⚠️ Encontradas URLs blob na galeria. Isso indica que as imagens ainda não foram processadas pelo MultiImageUpload.');
          console.log('📋 URLs blob encontradas:', blobUrls);
          
          // Aguardar um pouco para que o MultiImageUpload processe as imagens
          console.log('⏳ Aguardando processamento das imagens...');
          await new Promise(resolve => setTimeout(resolve, 3000)); // Aumentar tempo para 3 segundos
          
          // Verificar novamente se ainda há URLs blob
          const stillBlobUrls = finalGalleryUrls.filter((url: string) => url.startsWith('blob:'));
          if (stillBlobUrls.length > 0) {
            alert('⚠️ Algumas imagens ainda estão sendo processadas. Aguarde um momento e tente salvar novamente.');
            setIsUploading(false);
            return;
          }
        }

        // Extrair storage paths das URLs da galeria (apenas URLs do Supabase)
        finalGalleryStoragePaths = finalGalleryUrls
          .filter((url: string) => url.includes('supabase') && url.includes('product-images'))
          .map((url: string) => {
            // Extrair o path da URL do Supabase
            // Formato: https://[projeto].supabase.co/storage/v1/object/public/product-images/products/arquivo.jpg
            const match = url.match(/\/product-images\/(.+)$/);
            return match ? match[1] : '';
          })
          .filter(Boolean);

        console.log('🖼️ URLs finais da galeria:', finalGalleryUrls);
        console.log('📁 Paths de storage da galeria:', finalGalleryStoragePaths);

        // Conectar com Supabase
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
            search_keywords: formData.search_keywords || null,            vendor: formData.vendor || null,
            collection: formData.collection || null,
            notes: formData.notes || null,            care_instructions: formData.care_instructions || null,
            image_url: finalImageUrl,
            image_storage_path: finalImageStoragePath || null,
            gallery_urls: finalGalleryUrls,
            gallery_storage_paths: finalGalleryStoragePaths.length > 0 ? finalGalleryStoragePaths : null,
            
            // Badge display configuration
            show_colors_badge: formData.show_colors_badge !== false,
            show_materials_badge: formData.show_materials_badge !== false,
            show_sizes_badge: formData.show_sizes_badge !== false
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
          }
        } catch (supabaseError: any) {
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
  };  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">📝 Informações Básicas</h3>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Essencial</span>
          </div>
          
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
              className="max-w-xs"
            />
          </div>
        </div>      {/* Categorização - Campos mais flexíveis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">📂 Categorização</h3>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Organize seu produto</span>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>💡 Dica:</strong> Digite qualquer categoria que não esteja na lista para criá-la automaticamente. 
              Suas categorias personalizadas ficarão salvas para uso futuro.
            </p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartSelect
              label="Tipo de Produto"
              value={formData.type || ''}
              onChange={(type) => setFormData({ ...formData, type })}
              options={getAllTypes()}
              onAddNew={addCustomType}
              placeholder="Selecione ou crie um tipo"
              allowCustom={true}
            />

            <SmartSelect
              label="Estilo"
              value={formData.style || ''}
              onChange={(style) => setFormData({ ...formData, style })}
              options={getAllStyles()}
              onAddNew={addCustomStyle}
              placeholder="Selecione ou crie um estilo"
              allowCustom={true}
            />

            <SelectInput
              label="Fornecedor/Marca"
              value={formData.vendor || ''}
              onChange={(vendor) => setFormData({ ...formData, vendor })}
              options={vendorSuggestions}
              placeholder="Selecione ou crie um fornecedor"
              allowCustom={true}
            />

            <SelectInput
              label="Coleção"
              value={formData.collection || ''}
              onChange={(collection) => setFormData({ ...formData, collection })}
              options={collectionSuggestions}
              placeholder="Selecione ou crie uma coleção"
              allowCustom={true}
            />
          </div>
        </div>

        {/* Preços Adicionais - Seção opcional */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">💰 Preços Adicionais</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Opcional</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="compare_at_price">Preço Original (R$)</Label>
              <Input
                id="compare_at_price"
                type="number"
                step="0.01"
                value={formData.compare_at_price || ''}
                onChange={(e) => setFormData({ ...formData, compare_at_price: parseFloat(e.target.value) || 0 })}
                placeholder="Para mostrar desconto"
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
                placeholder="Seu custo interno"
              />
            </div>
          </div>
        </div>      {/* Características do Produto */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">🎨 Características</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Opcional</span>
          </div>
          
          <div className="space-y-6">
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
        </div>        {/* Imagens - Múltiplas imagens com carrossel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">🖼️ Imagens do Produto</h3>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Múltiplas imagens</span>
          </div>
          
          {/* Google Drive Picker */}
          <div className="space-y-2">
            <Label>Adicionar Imagens</Label>
            <GoogleDrivePicker 
              onSelect={(selectedImages) => {
                setFormData({ ...formData, gallery_urls: selectedImages });
              }}
              selectedImages={formData.gallery_urls || []}
              maxImages={5}
            />
          </div>

          {/* Preview das imagens selecionadas */}
          {formData.gallery_urls && formData.gallery_urls.length > 0 && (
            <div className="space-y-2">
              <Label>Imagens Selecionadas ({formData.gallery_urls.length}/5)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {formData.gallery_urls.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={url}
                      alt={`Produto ${index + 1}`}
                      fill
                      className="object-cover rounded-lg border"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                        Principal
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => {
                        const newImages = formData.gallery_urls.filter((_: string, i: number) => i !== index);
                        setFormData({ ...formData, gallery_urls: newImages });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="alt_text">Texto Alternativo (ALT)</Label>
            <Input
              id="alt_text"
              value={formData.alt_text || ''}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              placeholder="Descrição das imagens para acessibilidade"
            />
          </div>
        </div>{/* Inventário e Controle - Seção opcional */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">📦 Inventário</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Opcional</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sku">SKU (Código)</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Ex: COL-001"
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
            <div className="flex items-center space-x-2">            <Checkbox
                id="track_inventory"
                checked={formData.track_inventory || false}
                onCheckedChange={handleTrackInventoryChange}
              />
              <Label htmlFor="track_inventory">Controlar Estoque</Label>
            </div>

            <div className="flex items-center space-x-2">            <Checkbox
                id="allow_backorder"
                checked={formData.allow_backorder || false}
                onCheckedChange={handleAllowBackorderChange}
              />
              <Label htmlFor="allow_backorder">Permitir Encomenda</Label>
            </div>
          </div>
        </div>      {/* Status e Promoções - Seção opcional */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">🏷️ Status e Promoções</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Opcional</span>
          </div>
          
          <div className="flex flex-wrap gap-4">            <div className="flex items-center space-x-2">              <Checkbox
                id="is_active"
                checked={Boolean(formData.is_active ?? true)}
                onCheckedChange={handleIsActiveChange}
              />
              <Label htmlFor="is_active">Produto Ativo</Label>
            </div>

            <div className="flex items-center space-x-2">              <Checkbox
                id="is_featured"
                checked={formData.is_featured || false}
                onCheckedChange={handleIsFeaturedChange}
              />
              <Label htmlFor="is_featured">Produto em Destaque</Label>
            </div>

            <div className="flex items-center space-x-2">              <Checkbox
                id="is_new_arrival"
                checked={formData.is_new_arrival || false}
                onCheckedChange={handleIsNewArrivalChange}
              />
              <Label htmlFor="is_new_arrival">Produto Novo</Label>
            </div>

            <div className="flex items-center space-x-2">              <Checkbox
                id="is_on_sale"
                checked={formData.is_on_sale || false}
                onCheckedChange={handleIsOnSaleChange}
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
            </div>          )}
        </div>

        {/* Configuração de Badges - Seção nova */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">🏷️ Configuração de Badges</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Controla a exibição</span>
          </div>
          
          <div className="p-4 bg-blue-50/50 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure quais badges serão exibidos nos cards de produto nas páginas de produtos, favoritos e full-store.
            </p>
            
            <div className="flex flex-wrap gap-4">              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_colors_badge"
                  checked={Boolean(formData.show_colors_badge)}
                  onCheckedChange={handleShowColorsBadgeChange}
                />
                <Label htmlFor="show_colors_badge">Mostrar Badge de Cores</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_materials_badge"
                  checked={Boolean(formData.show_materials_badge)}
                  onCheckedChange={handleShowMaterialsBadgeChange}
                />
                <Label htmlFor="show_materials_badge">Mostrar Badge de Materiais</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_sizes_badge"
                  checked={Boolean(formData.show_sizes_badge)}
                  onCheckedChange={handleShowSizesBadgeChange}
                />
                <Label htmlFor="show_sizes_badge">Mostrar Badge de Tamanhos</Label>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mt-2">
              💡 <strong>Dica:</strong> Os badges ajudam os clientes a identificar rapidamente as características dos produtos. 
              Desmarque para produtos onde essas informações não são relevantes.
            </div>
          </div>
        </div>      {/* SEO - Seção opcional */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">🔍 SEO</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Opcional</span>
          </div>
          
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

        {/* Notas Internas - Seção opcional */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">📝 Notas Internas</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Opcional</span>
          </div>
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
          
          <div>
            <Label htmlFor="care_instructions">🧼 Instruções de Cuidados</Label>
            <Textarea
              id="care_instructions"
              value={formData.care_instructions || ''}
              onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
              placeholder="Ex: Lavar à mão com água fria, não usar alvejante, secar à sombra..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Instruções para conservação e manutenção do produto (aparecerá na página do produto)
            </p>
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
    </div>
  );
}

// Interface para Coleções
interface Collection {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  isActive: boolean;
  productIds: string[];
  displayOrder: number;
  createdAt: Date;
}

// Componente de Gerenciamento de Coleções
function CollectionsManagement({ products }: { products: Product[] }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar coleções (localStorage como fallback, Supabase como preferência)
  useEffect(() => {
    const loadCollections = async () => {
      try {
        // Tentar carregar do Supabase primeiro
        const { data: supabaseCollections, error } = await supabase
          .from('collections_with_counts')
          .select('*')
          .order('display_order');        if (!error && supabaseCollections && supabaseCollections.length > 0) {
          console.log('✅ Coleções carregadas do Supabase:', supabaseCollections.length);
          setCollections(supabaseCollections.map(c => ({
            id: c.id, // Usar UUID real do Supabase
            name: c.name,
            description: c.description,
            slug: c.slug,
            color: c.color,
            isActive: c.is_active,
            displayOrder: c.display_order,
            productIds: [], // Será carregado separadamente
            createdAt: new Date(c.created_at)
          })));
          
          // Carregar produtos das coleções
          await loadCollectionProducts(supabaseCollections);
        } else {
          // Fallback para localStorage
          const stored = localStorage.getItem('micangaria_collections');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setCollections(parsed.map((c: any) => ({
                ...c,
                createdAt: new Date(c.createdAt)
              })));
              console.log('📦 Coleções carregadas do localStorage:', parsed.length);
            } catch (error) {
              console.error('Erro ao carregar coleções do localStorage:', error);
              initializeDefaultCollections();
            }
          } else {
            initializeDefaultCollections();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar coleções:', error);
        initializeDefaultCollections();
      }
    };

    loadCollections();
  }, []);

  // Carregar produtos das coleções do Supabase
  const loadCollectionProducts = async (collectionsData: any[]) => {
    try {
      const { data: collectionProducts, error } = await supabase
        .from('collection_products')
        .select('collection_id, product_id');      if (!error && collectionProducts) {
        const updatedCollections = collectionsData.map(collection => ({
          id: collection.id,
          name: collection.name,
          description: collection.description,
          slug: collection.slug,
          color: collection.color,
          isActive: collection.is_active,
          displayOrder: collection.display_order,
          productIds: collectionProducts
            .filter(cp => cp.collection_id === collection.id)
            .map(cp => cp.product_id),
          createdAt: new Date(collection.created_at)
        }));
        setCollections(updatedCollections);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos das coleções:', error);
    }
  };

  // Inicializar coleções padrão
  const initializeDefaultCollections = () => {
    const defaultCollections = [
      {
        id: '1',
        name: 'Promoções Especiais',
        description: 'Produtos em destaque com preços especiais',
        slug: 'promocoes-especiais',
        color: '#dc2626',
        isActive: true,
        productIds: [],
        displayOrder: 1,
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Novidades',
        description: 'Últimas peças que chegaram ao nosso acervo',
        slug: 'novidades',
        color: '#16a34a',
        isActive: true,
        productIds: [],
        displayOrder: 2,
        createdAt: new Date()
      },
      {
        id: '3',
        name: 'Peças Selecionadas',
        description: 'Curadoria especial de peças exclusivas',
        slug: 'pecas-selecionadas',
        color: '#9333ea',
        isActive: true,
        productIds: [],
        displayOrder: 3,
        createdAt: new Date()
      },
      {
        id: '4',
        name: 'Coleção Vintage',
        description: 'Autênticas peças vintage com história',
        slug: 'colecao-vintage',
        color: '#eab308',
        isActive: true,
        productIds: [],
        displayOrder: 4,
        createdAt: new Date()
      }
    ];
    setCollections(defaultCollections);
    localStorage.setItem('micangaria_collections', JSON.stringify(defaultCollections));
  };

  // Salvar no Supabase e localStorage
  const saveCollections = async (newCollections: Collection[]) => {
    setCollections(newCollections);
    localStorage.setItem('micangaria_collections', JSON.stringify(newCollections));
    setHasUnsavedChanges(true);
  };
  // Salvar todas as mudanças no Supabase
  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    try {
      console.log('💾 Salvando coleções no Supabase...');
      
      for (const collection of collections) {
        console.log(`📝 Processando coleção: ${collection.name} (${collection.slug})`);
        
        // Buscar coleção existente pelo slug
        const { data: existingCollection, error: selectError } = await supabase
          .from('collections')
          .select('id')
          .eq('slug', collection.slug)
          .single();
          
        if (selectError && selectError.code !== 'PGRST116') {
          console.error('❌ Erro ao buscar coleção:', selectError);
          continue;
        }

        const collectionData = {
          name: collection.name,
          description: collection.description,
          slug: collection.slug,
          color: collection.color,
          is_active: collection.isActive,
          display_order: collection.displayOrder,
        };

        let collectionId: string;

        if (existingCollection) {
          // Atualizar coleção existente
          console.log(`🔄 Atualizando coleção existente: ${existingCollection.id}`);
          const { error: updateError } = await supabase
            .from('collections')
            .update(collectionData)
            .eq('id', existingCollection.id);
            
          if (updateError) {
            console.error('❌ Erro ao atualizar coleção:', updateError);
            continue;
          }
          collectionId = existingCollection.id;
        } else {
          // Criar nova coleção
          console.log(`➕ Criando nova coleção: ${collection.name}`);
          const { data: newCollection, error: insertError } = await supabase
            .from('collections')
            .insert([collectionData])
            .select('id')
            .single();
            
          if (insertError) {
            console.error('❌ Erro ao criar coleção:', insertError);
            continue;
          }
          
          if (!newCollection) {
            console.error('❌ Nenhuma coleção retornada após inserção');
            continue;
          }
          
          collectionId = newCollection.id;
        }

        console.log(`🆔 ID da coleção para produtos: ${collectionId}`);

        // Limpar produtos existentes da coleção
        const { error: deleteError } = await supabase
          .from('collection_products')
          .delete()
          .eq('collection_id', collectionId);
          
        if (deleteError) {
          console.error('❌ Erro ao deletar produtos da coleção:', deleteError);
        }

        // Adicionar produtos à coleção
        if (collection.productIds.length > 0) {
          console.log(`📦 Adicionando ${collection.productIds.length} produtos à coleção`);
          console.log('🔍 Product IDs:', collection.productIds);
          
          const collectionProducts = collection.productIds.map((productId, index) => ({
            collection_id: collectionId,
            product_id: productId,
            display_order: index
          }));
          
          console.log('💾 Dados para inserção:', collectionProducts);

          const { data: insertedData, error: insertProductsError } = await supabase
            .from('collection_products')
            .insert(collectionProducts)
            .select();

          if (insertProductsError) {
            console.error('❌ Erro ao inserir produtos na coleção:', insertProductsError);
            console.error('🔍 Detalhes do erro:', JSON.stringify(insertProductsError, null, 2));
          } else {
            console.log('✅ Produtos inseridos com sucesso:', insertedData?.length || 0);
          }        } else {
          console.log('📝 Nenhum produto selecionado para esta coleção');
        }
      }

      setHasUnsavedChanges(false);
      alert('✅ Coleções salvas com sucesso no Supabase!');
      console.log('✅ Todas as coleções foram processadas');
      
    } catch (error) {
      console.error('❌ Erro geral ao salvar no Supabase:', error);
      alert('❌ Erro ao salvar no Supabase. Dados mantidos localmente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCollection = (collectionData: Partial<Collection>) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name: collectionData.name || '',
      description: collectionData.description || '',
      slug: (collectionData.name || '').toLowerCase().replace(/\s+/g, '-'),
      color: collectionData.color || '#6b7280',
      isActive: true,
      productIds: [],
      displayOrder: collections.length + 1,
      createdAt: new Date()
    };

    saveCollections([...collections, newCollection]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateCollection = (id: string, updates: Partial<Collection>) => {
    const updatedCollections = collections.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    saveCollections(updatedCollections);
    setEditingCollection(null);
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta coleção?')) {
      const filteredCollections = collections.filter(c => c.id !== id);
      saveCollections(filteredCollections);
    }
  };

  const handleToggleProduct = (collectionId: string, productId: string) => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        const productIds = collection.productIds.includes(productId)
          ? collection.productIds.filter(id => id !== productId)
          : [...collection.productIds, productId];
        return { ...collection, productIds };
      }
      return collection;
    });
    saveCollections(updatedCollections);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Gerenciar Coleções</h2>
          <p className="text-muted-foreground">
            Organize produtos em coleções temáticas para exibição no site
          </p>
        </div>
        
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button 
              onClick={handleSaveToSupabase}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Mudanças
                </>
              )}
            </Button>
          )}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Coleção
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-h-[90vh] overflow-y-auto"
            >
              <DialogHeader>
                <DialogTitle>Criar Nova Coleção</DialogTitle>
              </DialogHeader>
              <CollectionForm 
                onSave={handleCreateCollection}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Aviso sobre mudanças não salvas */}
      {hasUnsavedChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Você tem mudanças não salvas. Clique em "Salvar Mudanças" para sincronizar com o Supabase.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Coleções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {collections.map(collection => (
          <Card key={collection.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: collection.color }}
                  />
                  <div>
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {collection.productIds.length} produtos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={collection.isActive ? "default" : "secondary"}>
                    {collection.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCollection(collection)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {collection.description}
              </p>
              
              {/* Produtos na Coleção */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Produtos na Coleção:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {products.map(product => {
                    const isInCollection = collection.productIds.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-2 rounded border transition-colors ${
                          isInCollection ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              R$ {product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          checked={isInCollection}
                          onCheckedChange={() => handleToggleProduct(collection.id, product.id)}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {products.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum produto disponível</p>
                    <p className="text-xs">Adicione produtos primeiro na aba "Produtos"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>      {/* Dialog de Edição */}
      {editingCollection && (
        <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Coleção</DialogTitle>
            </DialogHeader>
            <CollectionForm 
              collection={editingCollection}
              onSave={(updates) => handleUpdateCollection(editingCollection.id, updates)}
              onCancel={() => setEditingCollection(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Formulário de Coleção
function CollectionForm({ 
  collection, 
  onSave, 
  onCancel 
}: {
  collection?: Collection;
  onSave: (data: Partial<Collection>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: collection?.name || '',
    description: collection?.description || '',
    color: collection?.color || '#6b7280',
    isActive: collection?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const predefinedColors = [
    '#dc2626', '#ea580c', '#d97706', '#eab308', 
    '#16a34a', '#059669', '#0891b2', '#0284c7',
    '#6366f1', '#8b5cf6', '#9333ea', '#c026d3',
    '#e11d48', '#6b7280', '#374151', '#111827'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="block">Nome da Coleção</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Promoções Especiais"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="block">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva o propósito desta coleção..."
          rows={3}
        />
      </div>

      <div>
        <Label className="block mb-2">Cor da Coleção</Label>
        <div className="grid grid-cols-8 gap-2">
          {predefinedColors.map(color => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-ring' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData(prev => ({ ...prev, color }))}
            />
          ))}
        </div>
        <Input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          className="mt-2 w-20 h-8"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
        />
        <Label htmlFor="isActive">Coleção ativa (visível no site)</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
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
