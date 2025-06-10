'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Info, ShoppingBag, Search } from 'lucide-react'; 
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redireciona para a página de produtos com query de pesquisa
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };  return (
    <header className="bg-card text-foreground shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        {/* Layout desktop: tudo em uma linha */}
        <div className="hidden md:flex items-center justify-between gap-4">          {/* Logo à esquerda */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo.svg"
              alt="RÜGE"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          
          {/* Barra de pesquisa centralizada */}
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
          
          {/* Navegação à direita */}
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors flex items-center space-x-1 whitespace-nowrap">
                  <ShoppingBag size={20} />
                  <span>Produtos</span>
                </Link>
              </li>              <li>
                <Link href="/style-advisor" className="hover:text-primary transition-colors flex items-center space-x-1 whitespace-nowrap">
                  <Sparkles size={20} /> 
                  <span>Consultoria de Imagem</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors flex items-center space-x-1 whitespace-nowrap">
                  <Info size={20} />
                  <span>Sobre Nós</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Layout mobile: empilhado */}
        <div className="md:hidden space-y-4">          {/* Primeira linha: Logo e navegação compacta */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.svg"
                alt="RÜGE"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            
            {/* Menu compacto mobile */}
            <nav>
              <ul className="flex items-center space-x-3">
                <li>
                  <Link href="/products" className="hover:text-primary transition-colors p-2">
                    <ShoppingBag size={20} />
                  </Link>
                </li>
                <li>
                  <Link href="/style-advisor" className="hover:text-primary transition-colors p-2">
                    <Sparkles size={20} />
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors p-2">
                    <Info size={20} />
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Segunda linha: Barra de pesquisa full width */}
          <form onSubmit={handleSearch} className="w-full">
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
        </div>
      </div>
    </header>
  );
}
