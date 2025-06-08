'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products as allProducts, Product, uniqueTypes, uniqueStyles, uniqueColors } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Tag, ListFilter, Search, Heart, ShoppingBag, Star, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSearchParams } from 'next/navigation';

interface Filters {
  type: string | null;
  style: string | null;
  colors: string[];
  searchTerm: string;
  showNew: boolean;
  showPromotions: boolean;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card id={product.id} className="group flex flex-col h-full shadow-md hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden bg-card border-0 hover:-translate-y-2">
      <CardHeader className="p-0 relative overflow-hidden">
        <div className="aspect-square relative w-full overflow-hidden rounded-t-xl">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            data-ai-hint={product.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNewArrival && (
              <Badge className="bg-accent text-accent-foreground font-bold shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                NOVO
              </Badge>
            )}
            {product.isPromotion && (
              <Badge className="bg-destructive text-destructive-foreground font-bold shadow-lg animate-pulse">
                <Tag className="w-3 h-3 mr-1" />
                OFERTA
              </Badge>
            )}
          </div>
          
          {/* Heart Icon */}
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white hover:text-destructive transition-all duration-300 rounded-full opacity-0 group-hover:opacity-100"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {product.type}
          </Badge>
          <Badge variant="secondary" className="text-xs capitalize">
            {product.style}
          </Badge>
        </div>
        
        <CardTitle className="text-lg sm:text-xl font-headline text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
          {product.name}
        </CardTitle>
        
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </CardDescription>
        
        <div className="flex items-center justify-between pt-2">
          <p className="text-xl sm:text-2xl font-bold text-primary">
            R$ {product.price.toFixed(2)}
          </p>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        </div>
        
        {product.isPromotion && product.promotionDetails && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mt-3">
            <p className="text-sm text-accent-foreground font-medium flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              {product.promotionDetails}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 sm:p-6 pt-0">
        <Button 
          asChild 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all duration-300 group-hover:bg-primary/80"
        >
          <Link href={`/products#${product.id}`}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ver Detalhes
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function FilterControls({ filters, setFilters }: { filters: Filters, setFilters: (filters: Filters) => void}) {
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
  const [filters, setFilters] = useState<Filters>({
    type: null,
    style: null,
    colors: [],
    searchTerm: '',
    showNew: false,
    showPromotions: false,
  });

  // Set initial filters based on URL params
  useEffect(() => {
    const filter = searchParams.get('filter');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
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
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
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
  }, [filters]);

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
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Nossa Coleção Completa
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline text-primary mb-4">
              Encontre Sua Peça Perfeita
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore nossa coleção cuidadosamente curada de acessórios únicos, cada peça conta uma história.
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
                  <FilterControls filters={filters} setFilters={setFilters} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
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
                <FilterControls filters={filters} setFilters={setFilters} />
              </CardContent>
            </Card>
          </aside>
          
          {/* Products Grid */}
          <main className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
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
