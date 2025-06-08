import Link from 'next/link';
import Image from 'next/image';
import { products, Product } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Tag, Zap, Sparkles } from 'lucide-react';

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden bg-card">
      <CardHeader className="p-0">
        <div className="aspect-video relative w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={product.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-xl mb-2 font-headline text-primary">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 capitalize">{product.style} {product.type}</CardDescription>
        <p className="text-lg font-semibold text-foreground">${product.price.toFixed(2)}</p>
        {product.isPromotion && product.promotionDetails && (
          <p className="text-sm text-accent-foreground bg-accent px-2 py-1 rounded inline-flex items-center mt-1">
            <Tag size={16} className="mr-1" /> {product.promotionDetails}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <Link href={`/products#${product.id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function HomePage() {
  const featuredProducts = products.filter(p => p.isNewArrival || p.isPromotion).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 3);
  const promotions = products.filter(p => p.isPromotion).slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-16 md:py-24 rounded-lg overflow-hidden bg-card shadow-xl">
        <Image 
          src="https://placehold.co/1200x500.png" 
          alt="Acessórios boho e indígenas em destaque" 
          layout="fill" 
          objectFit="cover" 
          className="opacity-20"
          data-ai-hint="boho accessories" 
        />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-headline text-primary mb-6">
            Descubra Seu Estilo Único
          </h1>
          <p className="text-lg md:text-xl text-foreground mb-8 max-w-2xl mx-auto">
            Explore acessórios artesanais boho e indígenas que contam uma história.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/products">Ver Coleção <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-headline text-primary flex items-center">
              <Zap size={28} className="mr-2 text-secondary" /> Novidades
            </h2>
            <Button variant="link" asChild className="text-accent-foreground hover:text-primary">
              <Link href="/products?filter=new">Ver Todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Special Promotions Section */}
      {promotions.length > 0 && (
        <section>
           <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-headline text-primary flex items-center">
              <Tag size={28} className="mr-2 text-secondary" /> Promoções Especiais
            </h2>
            <Button variant="link" asChild className="text-accent-foreground hover:text-primary">
              <Link href="/products?filter=promotions">Ver Todas <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      
      {/* Call to action for AI Style Advisor */}
      <section className="py-12 bg-card rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-headline text-primary mb-4">Precisa de Dicas de Estilo?</h2>
        <p className="text-lg text-foreground mb-6 max-w-xl mx-auto">
          Deixe nosso Consultor de Estilo AI ajudar você a encontrar os acessórios perfeitos para qualquer look ou ocasião.
        </p>
        <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Link href="/style-advisor">Experimente o Consultor AI <Sparkles className="ml-2 h-5 w-5" /></Link>
        </Button>
      </section>
    </div>
  );
}
