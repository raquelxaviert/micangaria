'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Info, ShoppingBag, Search, Menu, User, LogOut, ShoppingCart, Star, Tag, TrendingUp, Gem, Truck } from 'lucide-react'; 
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/AuthModal_centered';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { CartManager } from '@/lib/ecommerce';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, signOut } = useAuth();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Atualizar contador do carrinho
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(CartManager.getItemCount());
    };
    
    // Inicializar
    updateCartCount();
    
    // Escutar mudanças no carrinho
    window.addEventListener('cartChanged', updateCartCount);
    
    return () => window.removeEventListener('cartChanged', updateCartCount);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redireciona para a página de produtos com query de pesquisa
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      }
    }
  };

  const handleAllProductsClick = () => {
    // Limpar qualquer filtro ativo
    window.location.href = '/products';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Coleções para o menu lateral
  const menuCollections = [
    { name: 'Novidades', href: '/products?filter=new', icon: Star },
    { name: 'Promoções', href: '/products?filter=promotions', icon: Tag },
    { name: 'Mais Vendidos', href: '/products?filter=bestsellers', icon: TrendingUp },
    { name: 'Vintage Collection', href: '/products?collection=vintage', icon: Gem },
  ];

  const MenuSidebar = () => (
    <div className="mt-6 space-y-6 pb-6">
      {/* Barra de Pesquisa Mobile */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10 pr-4 py-2 w-full bg-muted/50 border-0 rounded-xl focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Navegação Principal */}
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Navegação
        </h3>
        <div className="space-y-2">
          <SheetClose asChild>
            <Link href="/products" onClick={handleAllProductsClick} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
              <ShoppingBag size={18} />
              <span>Todos os Produtos</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/style-advisor" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
              <Sparkles size={18} />
              <span>Consultoria de Imagem</span>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/about" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
              <Info size={18} />
              <span>Sobre Nós</span>
            </Link>
          </SheetClose>
        </div>
      </div>

      {/* Categorias Dinâmicas */}
      {!categoriesLoading && categories.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Categorias
          </h3>
          <div className="space-y-2">
            {categories.slice(0, 6).map((category) => (
              <SheetClose key={category.type} asChild>
                <Link 
                  href={`/products?type=${category.type}`} 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Gem size={18} className="text-foreground" />
                  <span>{category.name}</span>
                </Link>
              </SheetClose>
            ))}
          </div>
        </div>
      )}

      {/* Coleções */}
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Coleções
        </h3>
        <div className="space-y-2">
          {menuCollections.map((collection) => {
            const IconComponent = collection.icon;
            return (
              <SheetClose key={collection.name} asChild>
                <Link href={collection.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                  <IconComponent size={18} className="text-foreground" />
                  <span>{collection.name}</span>
                </Link>
              </SheetClose>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 text-foreground shadow-md border-b border-border" style={{ transform: 'translate3d(0, 0, 0)', willChange: 'auto', backfaceVisibility: 'hidden' }}>
      
      {/* Faixa de aviso sobre frete grátis */}
      <div className="bg-background text-foreground text-center py-2 px-4 text-sm font-medium border-b border-border/40">
        <div className="flex items-center justify-center gap-2">
          <Truck size={16} />
          <span>Frete grátis em pedidos acima de R$ 300</span>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        {/* Layout desktop */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Menu Hamburger + Logo à esquerda */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-[#F5F0EB]">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="flex items-center justify-center">
                    <Image
                      src="/logo_completa.svg"
                      alt="RÜGE"
                      width={120}
                      height={40}
                      className="h-8 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>
                
                <MenuSidebar />
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.svg"
                alt="RÜGE"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          {/* Barra de pesquisa moderna */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative flex">
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 bg-background border-primary/20 focus:border-primary"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 px-3 bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Search size={16} />
              </Button>
            </div>
          </form>
          
          {/* Navegação rápida à direita */}
          <nav className="flex items-center gap-2">
            <ClientOnly>
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="hover:bg-primary hover:text-[#F5F0EB]"
                  title={`Sair (${user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'})`}
                >
                  <LogOut size={20} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hover:bg-primary hover:text-[#F5F0EB]"
                  title="Entrar"
                >
                  <User size={20} />
                </Button>
              )}
            </ClientOnly>
            
            {/* Botão Todos os Produtos */}
            <Link href="/products" onClick={handleAllProductsClick}>
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-[#F5F0EB]" title="Todos os Produtos">
                <ShoppingBag size={20} />
              </Button>
            </Link>
            
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-[#F5F0EB]">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </nav>
        </div>

        {/* Layout mobile */}
        <div className="md:hidden space-y-4">
          {/* Primeira linha: Menu hamburger, Logo e ações */}
          <div className="flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-[#F5F0EB]">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="flex items-center justify-center">
                    <Image
                      src="/logo_completa.svg"
                      alt="RÜGE"
                      width={120}
                      height={40}
                      className="h-8 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>
                
                <MenuSidebar />
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.svg"
                alt="RÜGE"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            
            {/* Ações do mobile: Usuário, Sacolinha, Carrinho */}
            <div className="flex items-center gap-2">
              {/* Botão de Usuário no Mobile */}
              <ClientOnly>
                {user ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="hover:bg-primary hover:text-[#F5F0EB]"
                    title={`Sair (${user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'})`}
                  >
                    <LogOut size={20} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hover:bg-primary hover:text-[#F5F0EB]"
                    title="Entrar"
                  >
                    <User size={20} />
                  </Button>
                )}
              </ClientOnly>
              
              {/* Botão Todos os Produtos no Mobile */}
              <Link href="/products" onClick={handleAllProductsClick}>
                <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-[#F5F0EB]" title="Todos os Produtos">
                  <ShoppingBag size={20} />
                </Button>
              </Link>
              
              {/* Carrinho no Mobile */}
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="hover:bg-primary hover:text-[#F5F0EB]">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Autenticação */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
}
