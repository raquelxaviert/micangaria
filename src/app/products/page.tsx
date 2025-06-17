'use client';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Product } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X, ListFilter, Search, Sparkles, Zap, Tag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSearchParams } from 'next/navigation';
import { ProductCard, ProductData } from '@/components/ui/ProductCard';
import { createClient } from '@/lib/supabase/client';

interface Filters {
  type: string | null;
  style: string | null;
  colors: string[];
  searchTerm: string;
  showNew: boolean;
  showPromotions: boolean;
}

// Convert Product to ProductData format for compatibility with ProductCard
function convertProductToProductData(product: Product): ProductData {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl, // Formato antigo
    image_url: product.imageUrl, // Formato Supabase
    gallery_urls: product.galleryUrls || [], // Array de imagens adicionais
    type: product.type,
    style: product.style,
    colors: product.colors,
    materials: product.materials || [],
    sizes: product.sizes || [],
    is_new_arrival: product.isNewArrival,
    is_promotion: product.isPromotion,    promotion_details: product.promotionDetails || undefined,
    slug: product.slug, // Adicionar slug para URLs amigáveis
    // Badge display configuration
    show_colors_badge: product.show_colors_badge,
    show_materials_badge: product.show_materials_badge,
    show_sizes_badge: product.show_sizes_badge
  };
}

function FilterControls({ 
  filters, 
  setFilters,
  uniqueTypes,
  uniqueStyles,
  uniqueColors
}: { 
  filters: Filters, 
  setFilters: (filters: Filters) => void,
  uniqueTypes: string[],
  uniqueStyles: string[],
  uniqueColors: string[]
}) {
  const handleColorChange = (color: string) => {
    setFilters({
      ...filters,
      colors: filters.colors.includes(color)
        ? filters.colors.filter(c => c !== color)
        : [...filters.colors, color],
    });
  };

  const clearFilters = () => {
    setFilters({ type: null, style: null, colors: [], searchTerm: '', showNew: false, showPromotions: false });
  };

  const activeFiltersCount = [
    filters.type,
    filters.style,
    filters.colors.length > 0,
    filters.searchTerm,
    filters.showNew,
    filters.showPromotions
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-base sm:text-lg font-headline text-primary">Buscar</h3>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Digite o que procura..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="pl-10 bg-background border-primary/20 focus:border-primary rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base sm:text-lg font-headline text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Destacados
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={filters.showNew ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ ...filters, showNew: !filters.showNew })}
            className="justify-start text-xs sm:text-sm h-10"
          >
            <Zap className="w-4 h-4 mr-2" />
            Novidades
          </Button>
          <Button
            variant={filters.showPromotions ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters({ ...filters, showPromotions: !filters.showPromotions })}
            className="justify-start text-xs sm:text-sm h-10"
          >
            <Tag className="w-4 h-4 mr-2" />
            Ofertas
          </Button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base sm:text-lg font-headline text-primary">Categoria</h3>
        <Select
          value={filters.type || ''}
          onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? null : value })}
        >
          <SelectTrigger className="w-full bg-background border-primary/20 focus:border-primary rounded-lg">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base sm:text-lg font-headline text-primary">Estilo</h3>
        <Select
          value={filters.style || ''}
          onValueChange={(value) => setFilters({ ...filters, style: value === 'all' ? null : value })}
        >
          <SelectTrigger className="w-full bg-background border-primary/20 focus:border-primary rounded-lg">
            <SelectValue placeholder="Todos os estilos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estilos</SelectItem>
            {uniqueStyles.map(style => (
              <SelectItem key={style} value={style} className="capitalize">{style}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base sm:text-lg font-headline text-primary">Cores</h3>
        <div className="grid grid-cols-2 gap-3">
          {uniqueColors.map(color => (
            <Label
              key={color}
              htmlFor={`color-${color}`}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                filters.colors.includes(color)
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                id={`color-${color}`}
                checked={filters.colors.includes(color)}
                onCheckedChange={() => handleColorChange(color)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="capitalize text-sm">{color}</span>
            </Label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          onClick={clearFilters} 
          variant="outline" 
          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg"
        >
          <X className="mr-2 h-4 w-4" /> 
          Limpar Filtros ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}


function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    type: null,
    style: null,
    colors: [],
    searchTerm: '',
    showNew: false,
    showPromotions: false,
  });

  const supabase = createClient();
  // Calcular valores únicos dinamicamente dos produtos carregados
  const uniqueTypes = useMemo(() => {
    const types = products.map(p => p.type).filter(Boolean);
    const uniqueTypesArray = [...new Set(types)].sort();
    console.log('📂 Categorias (types) únicas encontradas:', uniqueTypesArray);
    return uniqueTypesArray;
  }, [products]);

  const uniqueStyles = useMemo(() => {
    const styles = products.map(p => p.style).filter(Boolean);
    const uniqueStylesArray = [...new Set(styles)].sort();
    console.log('🎨 Estilos únicos encontrados:', uniqueStylesArray);
    return uniqueStylesArray;
  }, [products]);

  const uniqueColors = useMemo(() => {
    const allColors = products.flatMap(p => p.colors || []).filter(Boolean);
    const uniqueColorsArray = [...new Set(allColors)].sort();
    console.log('🌈 Cores únicas encontradas:', uniqueColorsArray);
    return uniqueColorsArray;
  }, [products]);

  // Buscar produtos do Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar produtos:', error);
          return;
        }        if (data) {
          console.log('🔍 Dados do Supabase (primeiro produto):', data[0]);
            // Converter formato Supabase para formato Product
          const convertedProducts: Product[] = data.map(p => {
            // Debug dos campos materials e sizes
            console.log(`📦 Produto ${p.name}:`, {
              materials: p.materials,
              materialsType: typeof p.materials,
              sizes: p.sizes,
              sizesType: typeof p.sizes
            });            return {
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              imageUrl: p.image_url || '/products/placeholder.jpg',
              galleryUrls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
              imageHint: p.name.toLowerCase(),
              type: p.type,
              style: p.style,
              colors: Array.isArray(p.colors) ? p.colors : [],
              materials: Array.isArray(p.materials) ? p.materials : [],
              sizes: Array.isArray(p.sizes) ? p.sizes : [],
              isNewArrival: p.is_new_arrival || false,
              isPromotion: p.is_on_sale || false,
              promotionDetails: p.promotion_text || undefined,
              // Badge display configuration
              show_colors_badge: p.show_colors_badge,
              show_materials_badge: p.show_materials_badge,
              show_sizes_badge: p.show_sizes_badge
            };
          });
            console.log('✅ Produtos convertidos:', convertedProducts.length);          console.log('🔍 Primeiro produto convertido:', convertedProducts[0]);
          setProducts(convertedProducts);
          
          console.log('✅ Produtos carregados com sucesso:', convertedProducts.length);
        }
      } catch (error) {
        console.error('Erro ao conectar com Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [supabase]);
  // Set initial filters based on URL params
  useEffect(() => {
    const filter = searchParams.get('filter');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    
    if (filter === 'new') {
      setFilters(prev => ({ ...prev, showNew: true }));
    } else if (filter === 'promotions') {
      setFilters(prev => ({ ...prev, showPromotions: true }));
    }
    
    if (search) {
      setFilters(prev => ({ ...prev, searchTerm: search }));
    }

    if (category) {
      setFilters(prev => ({ ...prev, type: category }));
    }

    if (type) {
      setFilters(prev => ({ ...prev, type: type }));
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const typeMatch = !filters.type || product.type === filters.type;
      const styleMatch = !filters.style || product.style === filters.style;
      const colorMatch = filters.colors.length === 0 || product.colors.some(color => filters.colors.includes(color));
      
      // Busca tanto no nome quanto na descrição
      const searchTermMatch = filters.searchTerm === '' || 
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
        
      const newArrivalMatch = !filters.showNew || product.isNewArrival;
      const promotionMatch = !filters.showPromotions || product.isPromotion;
      return typeMatch && styleMatch && colorMatch && searchTermMatch && newArrivalMatch && promotionMatch;
    });
  }, [products, filters]);

  const activeFiltersCount = [
    filters.type,
    filters.style,
    filters.colors.length > 0,
    filters.searchTerm,
    filters.showNew,
    filters.showPromotions
  ].filter(Boolean).length;

  useEffect(() => {
    const elementId = window.location.hash.substring(1);
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }  }, []);
    // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8 max-w-full overflow-hidden">        {/* Header */}
        <div className="mb-6 sm:mb-12">
          <div className="text-center mb-4 sm:mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Nossa Coleção Completa
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline text-primary mb-4">
              Comece a garimpar...
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra nossa coleção de produtos selecionados com carinho, cada peça é uma expressão única de estilo. Navegue, filtre e encontre o que mais combina com você.
            </p>
          </div>

          {/* Results and Mobile Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                <span className="font-semibold text-primary">{filteredProducts.length}</span> produtos encontrados
              </p>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} filtros ativos
                </Badge>
              )}
            </div>

            {/* Mobile Filters Trigger */}
            <div className="w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto text-primary border-primary hover:bg-primary hover:text-primary-foreground relative"
                  >
                    <ListFilter className="mr-2 h-4 w-4" /> 
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-background">
                  <SheetHeader>
                    <SheetTitle className="text-xl sm:text-2xl font-headline text-primary flex items-center mt-4">
                      <Filter className="mr-2" />
                      Filtros
                    </SheetTitle>
                  </SheetHeader>
                  <FilterControls 
                    filters={filters} 
                    setFilters={setFilters}
                    uniqueTypes={uniqueTypes}
                    uniqueStyles={uniqueStyles}
                    uniqueColors={uniqueColors}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Desktop Filters - Hidden on mobile */}
          <aside className="hidden lg:block lg:w-80 xl:w-96 sticky top-6 h-fit">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-headline text-primary flex items-center">
                  <Filter className="mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <FilterControls 
                  filters={filters} 
                  setFilters={setFilters}
                  uniqueTypes={uniqueTypes}
                  uniqueStyles={uniqueStyles}
                  uniqueColors={uniqueColors}
                />
              </CardContent>
            </Card>
          </aside>          {/* Products Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id}>
                    <ProductCard 
                      product={convertProductToProductData(product)}
                      variant="compact"
                      showRating={false}
                      className="hover:-translate-y-1 sm:hover:-translate-y-2 w-full h-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 sm:p-12 text-center border-0 bg-card/50 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-headline text-primary">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Não encontramos produtos que correspondam aos seus critérios. Tente ajustar os filtros ou limpar a busca.
                  </p>
                  <Button 
                    onClick={() => setFilters({ type: null, style: null, colors: [], searchTerm: '', showNew: false, showPromotions: false })}
                    variant="outline"
                    className="mt-4"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar todos os filtros
                  </Button>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando nossa coleção...</p>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
