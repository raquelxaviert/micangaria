import Link from 'next/link';
import Image from 'next/image';
import { products, Product } from '@/lib/ruge-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Tag, Zap, Sparkles, Star, Heart, Shield, Leaf, Truck, RotateCcw, CreditCard, Award, Users, MapPin, Phone, Mail } from 'lucide-react';

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden bg-card border-0 hover:-translate-y-2">
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
            )}            {product.isPromotion && (
              <Badge className="bg-red-600 text-white font-bold shadow-lg animate-pulse">
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
      
      <CardContent className="flex-grow p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize border-primary/30 text-primary bg-primary/5">
            {product.style}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize border-secondary/30 text-secondary bg-secondary/5">
            {product.type}
          </Badge>
        </div>
        
        <CardTitle className="text-xl font-headline text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
          {product.name}
        </CardTitle>
        
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </CardDescription>
        
        <div className="flex items-center justify-between pt-2">
          <p className="text-2xl font-bold text-foreground">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        </div>
          {product.isPromotion && product.promotionDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-red-800 font-medium flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              {product.promotionDetails}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button 
          asChild 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all duration-300 group-hover:bg-primary/80"
        >
          <Link href={`/products#${product.id}`}>
            Ver Detalhes
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function HomePage() {
  const featuredProducts = products.filter(p => p.isNewArrival || p.isPromotion).slice(0, 6);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 6);  const promotions = products.filter(p => p.isPromotion).slice(0, 6);  // Categories for showcase
  const categories = [
    { name: 'Acessórios', count: products.filter(p => p.type === 'acessorio').length, icon: '💎' },
    { name: 'Bolsas', count: products.filter(p => p.type === 'bolsa').length, icon: '👜' },
    { name: 'Conjuntos', count: products.filter(p => p.type === 'conjunto').length, icon: '✨' },
  ];
  // Testimonials
  const testimonials = [
    {
      name: "Ana Beatriz",
      location: "São Paulo, SP",
      rating: 5,
      text: "Maria Clara tem um olhar único para peças especiais! Encontrei o vestido perfeito para meu evento.",
      product: "Vestido Vintage Anos 80"
    },
    {
      name: "Carolina Mendes",
      location: "Rio de Janeiro, RJ",
      rating: 5,
      text: "A curadoria é impecável. Cada peça tem história e personalidade. Simplesmente apaixonada!",
      product: "Blusa Vintage Saint Laurent"
    },
    {
      name: "Juliana Santos",
      location: "Belo Horizonte, MG",
      rating: 5,
      text: "Além das peças incríveis, a consultoria de styling transformou meu guarda-roupa. Recomendo demais!",
      product: "Consultoria de Styling"
    }
  ];
  return (
    <div className="space-y-8 sm:space-y-12 overflow-x-hidden">      {/* Hero Section - Enhanced */}
      <Link href="/products" className="block">
        <section className="relative overflow-hidden rounded-none sm:rounded-3xl min-h-[30vh] flex items-center cursor-pointer hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute inset-0">
            <Image
              src="/banner/banner.png"
              alt="Banner de acessórios boho"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 text-center">
            {/* Container interno com blur menor para facilitar leitura */}
            <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4 bg-background/60 backdrop-blur-[2px] p-2 sm:p-3 md:p-4 rounded-xl shadow-lg">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-headline leading-tight animate-fade-in px-2">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
                    <span className="animate-color-wave whitespace-nowrap">We don't whisper.</span>
                    <div className="flex items-center whitespace-nowrap gap-2 sm:gap-3">
                      <span className="animate-color-wave-alt">We</span>
                      <Image
                        src="/logo.svg"
                        alt="RÜGE Logo"
                        width={200}
                        height={80}
                        className="w-auto h-[1em] sm:h-[1em] inline-block translate-y-0.5 sm:translate-y-1"
                      />
                      <span className="animate-color-wave-alt">.</span>
                    </div>
                  </div>
                </h1>
                
                <p className="text-sm sm:text-base text-muted-foreground/80 mt-8 mb-6">
                  Clique para conhecer a coleção
                </p>
              </div>
            </div>
          </div>
        </section>
      </Link>{/* Featured Products Preview (MOVED HERE) */}
      <section className="container mx-auto px-4 sm:px-6">        <div className="text-center mb-8 sm:mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            Curadoria Especial
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary mb-4">
            Peças Selecionadas
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Tesouros únicos cuidadosamente garimpados para criar looks autênticos e atemporais.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 py-3 rounded-full w-full sm:w-auto"
          >
            <Link href="/products">
              Ver Toda Coleção
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories Section - New (NOW AFTER FEATURED PRODUCTS) */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-4 sm:mb-6">
            Explore por Categoria
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline text-primary mb-4 sm:mb-6">
            Encontre Seu Estilo
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Navegue pelas nossas categorias cuidadosamente organizadas e descubra peças únicas que combinam com sua personalidade.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <Card key={category.name} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br from-card to-primary/5 border-0">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center space-y-2 sm:space-y-4">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-headline text-sm sm:text-base lg:text-xl text-primary group-hover:text-primary/80 transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {category.count} produtos
                </p>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 text-xs sm:text-sm"
                >
                  <Link href={`/products?category=${category.name.toLowerCase()}`}>
                    <span className="hidden sm:inline">Ver Todos</span>
                    <span className="sm:hidden">Ver</span>
                    <ArrowRight className="ml-1 sm:ml-2 w-3 sm:w-4 h-3 sm:h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>      {/* Benefits Section - New */}
      <section className="bg-gradient-to-r from-muted/30 to-accent/5 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4 sm:mb-6">
              Por que escolher a RÜGE?
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary mb-4 sm:mb-6">
              Qualidade que Você Pode Confiar
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Cada peça é cuidadosamente selecionada com dedicação, materiais de qualidade e técnicas modernas.
            </p>
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center p-4 sm:p-6 lg:p-8 border-0 bg-card/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-headline text-primary mb-3 sm:mb-4">Qualidade Garantida</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Materiais selecionados e acabamento impecável em cada peça criada.
              </p>
            </Card>
            
            <Card className="text-center p-4 sm:p-6 lg:p-8 border-0 bg-card/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl font-headline text-primary mb-3 sm:mb-4">Entrega Rápida</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Frete grátis para todo Brasil e entrega expressa disponível.
              </p>
            </Card>
            
            <Card className="text-center p-4 sm:p-6 lg:p-8 border-0 bg-card/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-headline text-primary mb-3 sm:mb-4">Troca Fácil</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                30 dias para trocas e devoluções sem complicações.
              </p>
            </Card>
            
            <Card className="text-center p-8 border-0 bg-card/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-headline text-primary mb-4">Pagamento Seguro</h3>
              <p className="text-muted-foreground">
                Parcele em até 12x no cartão ou pague no PIX com desconto.
              </p>
            </Card>
          </div>
        </div>
      </section>      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 sm:p-3 bg-accent/10 rounded-full">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary">
                  Novidades
                </h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground max-w-md">
                Recém-chegados! As últimas adições à nossa coleção cuidadosamente curada.
              </p>
            </div>
            
            <Button 
              asChild 
              variant="ghost" 
              className="text-primary hover:text-primary/80 hover:bg-primary/10 group w-full sm:w-auto"
            >
              <Link href="/products?filter=new">
                <span className="hidden sm:inline">Ver Todas as Novidades</span>
                <span className="sm:hidden">Ver Todas</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials Section - New */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 sm:mb-6">
              Depoimentos
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary mb-4 sm:mb-6">              O que Nossos Clientes Dizem
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              A satisfação dos nossos clientes é nossa maior recompensa.
            </p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-4 sm:p-6 lg:p-8 border-0 bg-card/80 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex text-amber-400 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-sm sm:text-base text-muted-foreground text-center italic leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="text-center">
                    <p className="font-semibold text-primary text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      {testimonial.location}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {testimonial.product}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Promotions Section */}
      {promotions.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 sm:p-3 bg-destructive/10 rounded-full">
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary">
                  Promoções Especiais
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-md">
                Ofertas imperdíveis por tempo limitado. Não perca!
              </p>
            </div>
            
            <Button 
              asChild 
              variant="ghost" 
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 group"
            >
              <Link href="/products?filter=promotions">
                Ver Todas as Promoções
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Section - New */}
      <section className="bg-gradient-to-r from-secondary/10 to-primary/10 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-6">
                Fique por Dentro
              </Badge>
              <h2 className="text-4xl font-headline text-primary mb-6">
                Receba Novidades em Primeira Mão
              </h2>
              <p className="text-xl text-muted-foreground">
                Cadastre-se e receba ofertas exclusivas, lançamentos e dicas de estilo direto no seu email.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1">
                <input 
                  type="email" 
                  placeholder="Seu melhor email"
                  className="w-full px-6 py-4 rounded-full border-2 border-primary/20 focus:border-primary focus:outline-none text-center"
                />
              </div>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold"
              >
                Cadastrar
                <Mail className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Não enviamos spam. Você pode cancelar a qualquer momento.
            </p>
          </div>
        </div>
      </section>
        {/* CTA Section for Image Consultation */}
      <section className="bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Consultoria Personalizada
              </div>
              
              <h2 className="text-4xl md:text-5xl font-headline text-primary">
                Transforme Seu Estilo com Maria Clara
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Consultoria de imagem personalizada para descobrir seu estilo único com 
                acessórios vintage cuidadosamente selecionados.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link href="/style-advisor">
                  Agendar Consultoria de Styling
                  <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-4 text-lg font-semibold rounded-full"
              >
                <Link href="/about">
                  Sobre Maria Clara
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
