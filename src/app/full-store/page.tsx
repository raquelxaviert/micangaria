'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShoppingBag, Heart, Star, Truck, CreditCard, Sparkles, Eye, ShoppingCart, Plus } from 'lucide-react';
import CollectionSection from '@/components/CollectionSection';
import CategoriesSection from '@/components/CategoriesSection';
import { Product } from '@/lib/placeholder-data';
import { useState, useEffect } from 'react';
import { SimpleFastImage } from '@/components/ui/SimpleFastImage';
import { ProductCard } from '@/components/ui/ProductCard';

export default function FullStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const benefits = [
    { 
      icon: Truck, 
      title: 'Entrega Rápida', 
      description: 'Frete grátis para todo Brasil e entrega expressa disponível.' 
    },
    { 
      icon: CreditCard, 
      title: 'Pagamento Seguro', 
      description: 'Parcele em até 12x no cartão ou pague no PIX com desconto.' 
    }
  ];

  return (
    <div className="min-h-screen bg-background"> {/* Hero Section */}
      <Link href="/products" className="block cursor-pointer">
        <section className="relative overflow-hidden flex-1 min-h-[30vh] sm:min-h-[40vh] flex items-center"> {/* Changed min-h for mobile and sm screens */}
          <div className="absolute inset-0">
            {/* Desktop image */}
            <Image
              src="/banner/banner.png"
              alt="Banner RÜGE"
              fill
              className="object-cover hidden sm:block"
              priority
            />
            {/* Mobile image */}
            <Image
              src="/banner/banner_mobile.png"
              alt="Banner RÜGE Mobile"
              fill
              className="object-cover sm:hidden"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          </div>          <div className="relative z-10 container mx-auto px-6 sm:px-8 py-8 text-center">
            {/* Container interno com blur menor para facilitar leitura */}            <div className="max-w-3xl sm:max-w-4xl mx-auto space-y-6 bg-background/80 backdrop-blur-[2px] p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 rounded-2xl shadow-lg overflow-hidden">
              <div className="space-y-3 sm:space-y-4"> {/* More spacing for desktop */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-headline leading-tight animate-fade-in break-words hyphens-auto text-center"> {/* Increased font sizes */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    <span className="animate-color-wave whitespace-nowrap">We don't whisper.</span>
                    <div className="flex items-center whitespace-nowrap gap-2 sm:gap-3">
                      <span className="animate-color-wave-alt">We</span>                      <Image
                        src="/logo.svg"
                        alt="RÜGE Logo"
                        width={200}
                        height={80}
                        className="w-auto h-[1em] inline-block translate-y-0"
                      />
                      <span className="animate-color-wave-alt">.</span>
                    </div>
                  </div>                </h1>
                
                <p className="text-xs sm:text-sm text-foreground/80 hover:text-foreground transition-colors duration-200 pt-2 sm:pt-4"> {/* More spacing on desktop */}
                  Clique para conhecer a coleção 🐆
                </p>
              </div>
            </div>
          </div>
        </section>
      </Link>
      {/* Featured Products Section - Agora usando dados reais do Supabase */}      <CollectionSection 
        collectionSlug="pecas-selecionadas"
        title="Peças Selecionadas"
        badgeText="Curadoria Especial"
        badgeColor="#780116" // Added badgeColor
        description="Tesouros únicos cuidadosamente garimpados para criar looks autênticos e atemporais."
        maxProducts={6}
      />{/* Categories Section - Agora usando dados reais do Supabase */}
      <CategoriesSection />

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-muted/30 to-accent/5 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4 sm:mb-6">
              Por que escolher a RÜGE?
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Curadoria Autêntica
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Cada peça é escolhida a dedo com olhar atento para o que é único e estiloso com história.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>      {/* New Products Section - Agora usando dados reais do Supabase */}
      <CollectionSection 
        collectionSlug="novidades"
        title="Recém-chegados!"
        badgeText="Novidades"
        badgeColor="#16a34a"
        description="As últimas adições à nossa coleção."
        maxProducts={5}
      />      {/* Promotions Section - Agora usando dados reais do Supabase */}<CollectionSection 
        collectionSlug="promocoes-especiais"
        title="Ofertas imperdíveis por tempo limitado. Não perca!"
        badgeText="Promoções Especiais"
        badgeColor="#780116"
        description="Peças em destaque com preços especiais por tempo limitado."
        maxProducts={5}
      />

      {/* Newsletter Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-headline mb-4">
              Fique por Dentro
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Receba Novidades em Primeira Mão
            </p>
            <p className="text-muted-foreground mb-8">
              Cadastre-se e receba ofertas exclusivas, lançamentos e dicas de estilo direto no seu email.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Seu melhor email" 
                className="flex-1"
              />
              <Button type="submit">
                Cadastrar
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-4">
              Não enviamos spam. Você pode cancelar a qualquer momento.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Produtos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-square"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
