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
import { Filter, X, Tag, ListFilter } from 'lucide-react';
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
    <Card id={product.id} className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden group bg-card">
      <CardHeader className="p-0 relative">
        <div className="aspect-video w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={400}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={product.imageHint}
          />
        </div>
         {product.isNewArrival && (
          <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-xs font-semibold rounded">NOVO</div>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4">        <CardTitle className="text-xl mb-2 font-headline text-primary">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 capitalize">{product.style} {product.type}</CardDescription>
        <p className="text-lg font-semibold text-foreground">R$ {product.price.toFixed(2)}</p>
        {product.isPromotion && product.promotionDetails && (
          <p className="text-sm text-accent-foreground bg-accent px-2 py-1 rounded inline-flex items-center mt-1">
            <Tag size={16} className="mr-1" /> {product.promotionDetails}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          Ver Detalhes
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

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="font-semibold mb-2 text-lg font-headline text-primary">Busca</h3>
        <Input
          type="text"
          placeholder="Buscar por nome..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          className="bg-background"
        />
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-lg font-headline text-primary">Tipo</h3>
        <Select
          value={filters.type || ''}
          onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? null : value })}
        >
          <SelectTrigger className="w-full bg-background capitalize">
            <SelectValue placeholder="Todos os Tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-lg font-headline text-primary">Estilo</h3>
        <Select
          value={filters.style || ''}
          onValueChange={(value) => setFilters({ ...filters, style: value === 'all' ? null : value })}
        >
          <SelectTrigger className="w-full bg-background capitalize">
            <SelectValue placeholder="Todos os Estilos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Estilos</SelectItem>
            {uniqueStyles.map(style => (
              <SelectItem key={style} value={style} className="capitalize">{style}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-lg font-headline text-primary">Cor</h3>
        <div className="grid grid-cols-2 gap-2">
          {uniqueColors.map(color => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={filters.colors.includes(color)}
                onCheckedChange={() => handleColorChange(color)}
              />
              <Label htmlFor={`color-${color}`} className="capitalize">{color}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-lg font-headline text-primary">Especial</h3>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="showNew"
            checked={filters.showNew}
            onCheckedChange={(checked) => setFilters({ ...filters, showNew: !!checked })}
          />
          <Label htmlFor="showNew">Novidades</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showPromotions"
            checked={filters.showPromotions}
            onCheckedChange={(checked) => setFilters({ ...filters, showPromotions: !!checked })}
          />
          <Label htmlFor="showPromotions">Promoções</Label>
        </div>
      </div>
      <Button onClick={clearFilters} variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
        <X className="mr-2 h-4 w-4" /> Limpar Todos os Filtros
      </Button>
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
    if (filter === 'new') {
      setFilters(prev => ({ ...prev, showNew: true }));
    } else if (filter === 'promotions') {
      setFilters(prev => ({ ...prev, showPromotions: true }));
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const typeMatch = !filters.type || product.type === filters.type;
      const styleMatch = !filters.style || product.style === filters.style;
      const colorMatch = filters.colors.length === 0 || product.colors.some(color => filters.colors.includes(color));
      const searchTermMatch = product.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const newArrivalMatch = !filters.showNew || product.isNewArrival;
      const promotionMatch = !filters.showPromotions || product.isPromotion;
      return typeMatch && styleMatch && colorMatch && searchTermMatch && newArrivalMatch && promotionMatch;
    });
  }, [filters]);

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
    <div className="flex flex-col md:flex-row gap-8">
      {/* Desktop Filters */}
      <aside className="hidden md:block md:w-1/4 lg:w-1/5 sticky top-20 h-screen-minus-header-footer overflow-y-auto bg-card p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-headline text-primary mb-6 flex items-center"><Filter className="mr-2" />Filtros</h2>
        <FilterControls filters={filters} setFilters={setFilters} />
      </aside>

      {/* Mobile Filters Trigger */}
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full text-primary border-primary">
              <ListFilter className="mr-2 h-4 w-4" /> Mostrar Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-background">
            <SheetHeader>
              <SheetTitle className="text-2xl font-headline text-primary flex items-center mt-4"><Filter className="mr-2" />Filtros</SheetTitle>
            </SheetHeader>
            <FilterControls filters={filters} setFilters={setFilters} />
          </SheetContent>
        </Sheet>
      </div>
      
      <main className="flex-1">
        <h1 className="text-4xl font-headline text-primary mb-8">Nossa Coleção</h1>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-lg col-span-full">Nenhum produto corresponde aos seus filtros atuais. Tente ajustar sua seleção!</p>
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Carregando produtos...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
