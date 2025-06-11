import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShoppingBag, Heart, Star, Truck, Shield, CreditCard, RefreshCw, Sparkles } from 'lucide-react';
import CollectionSection from '@/components/CollectionSection';

export default function FullStorePage() {
  // Dados mock dos produtos
  const featuredProducts = [
    {
      id: '1',
      name: 'Anel Vintage Dourado',
      price: 185.90,
      image: '/products/anel.jpg',
      category: 'Acessórios',
      tags: ['vintage', 'acessorio'],
      isNew: true,
      description: 'Anel vintage em metal dourado com design atemporal. Uma peça que adiciona elegância e sofisticação ao seu look.'
    },
    {
      id: '2', 
      name: 'Bolsa Vintage Couro',
      price: 289.50,
      originalPrice: 361.88,
      image: '/products/bolsa.jpg',
      category: 'Bolsas',
      tags: ['vintage', 'bolsa'],
      isOffer: true,
      offerText: '20% OFF - Peça Única!',
      description: 'Bolsa de couro legítimo vintage, com pátina única que conta uma história. Peça atemporal e sofisticada.'
    },
    {
      id: '3',
      name: 'Brincos Vintage Elegantes', 
      price: 158.00,
      image: '/products/brinco.jpg',
      category: 'Acessórios',
      tags: ['retro', 'acessorio'],
      isNew: true,
      description: 'Brincos vintage com design exclusivo. Sofisticação e elegância em uma peça única e especial.'
    },
    {
      id: '4',
      name: 'Colar Vintage Dourado',
      price: 125.00,
      image: '/products/colar.jpg', 
      category: 'Acessórios',
      tags: ['retro', 'acessorio'],
      isOffer: true,
      offerText: 'Últimas peças!',
      description: 'Colar vintage com detalhes em ouro velho. Uma peça que adiciona sofisticação a qualquer produção.'
    },
    {
      id: '5',
      name: 'Colar Vintage Pedras',
      price: 165.50,
      image: '/products/colar2.jpg',
      category: 'Acessórios', 
      tags: ['boho-vintage', 'acessorio'],
      isNew: true,
      description: 'Colar vintage com pedras naturais. Peça boho-vintage com energia e personalidade única.'
    },
    {
      id: '6',
      name: 'Colar Vintage Cristal',
      price: 245.00,
      originalPrice: 288.24,
      image: '/products/colar3.jpg',
      category: 'Acessórios',
      tags: ['retro', 'acessorio'],
      isOffer: true,
      offerText: 'Edição Especial - 15% OFF',
      description: 'Colar vintage com cristais autênticos. Peça que irradia luz e sofisticação.'
    }
  ];

  const newProducts = [
    featuredProducts[0], // Anel Vintage Dourado
    featuredProducts[2], // Brincos Vintage Elegantes  
    featuredProducts[4], // Colar Vintage Pedras
    {
      id: '7',
      name: 'Conjunto Colar e Brincos',
      price: 298.50,
      image: '/products/conjunto_colar_e_brinco.jpg',
      category: 'Conjuntos',
      tags: ['retro', 'conjunto'], 
      isNew: true,
      description: 'Conjunto harmonioso colar e brincos vintage, perfeito para ocasiões especiais. Elegância garantida.'
    },
    {
      id: '8',
      name: 'Conjunto Pulseiras Premium',
      price: 195.50,
      image: '/products/conjunto_pulseiras.jpg',
      category: 'Conjuntos',
      tags: ['vintage', 'conjunto'],
      isNew: true,
      description: 'Coleção exclusiva de pulseiras vintage. Para quem busca autenticidade e estilo único.'
    }
  ];

  const promotionProducts = [
    featuredProducts[1], // Bolsa Vintage Couro
    featuredProducts[3], // Colar Vintage Dourado
    featuredProducts[5], // Colar Vintage Cristal
    {
      id: '9',
      name: 'Conjunto Pulseiras Vintage II',
      price: 142.00,
      originalPrice: 177.50,
      image: '/products/conjunto_pulseiras2.jpg',
      category: 'Conjuntos',
      tags: ['retro', 'conjunto'],
      isOffer: true,
      offerText: 'Combo especial!',
      description: 'Segunda coleção de pulseiras vintage com texturas e materiais variados.'
    },
    {
      id: '10',
      name: 'Sandália Vintage Couro',
      price: 225.90,
      originalPrice: 282.38,
      image: '/products/sandalia.jpg',
      category: 'Acessórios',
      tags: ['boho-vintage', 'acessorio'],
      isOffer: true,
      offerText: 'Últimas peças do verão!',
      description: 'Sandália vintage de couro artesanal. Conforto e estilo atemporal.'
    }
  ];

  const categories = [
    { name: 'Acessórios', count: 10, icon: '💎', href: '/products?category=acessorios' },
    { name: 'Bolsas', count: 1, icon: '👜', href: '/products?category=bolsas' },
    { name: 'Conjuntos', count: 7, icon: '✨', href: '/products?category=conjuntos' }
  ];

  const benefits = [
    { 
      icon: Shield, 
      title: 'Qualidade Garantida', 
      description: 'Materiais selecionados e acabamento impecável em cada peça criada.' 
    },
    { 
      icon: Truck, 
      title: 'Entrega Rápida', 
      description: 'Frete grátis para todo Brasil e entrega expressa disponível.' 
    },
    { 
      icon: RefreshCw, 
      title: 'Troca Fácil', 
      description: '30 dias para trocas e devoluções sem complicações.' 
    },
    { 
      icon: CreditCard, 
      title: 'Pagamento Seguro', 
      description: 'Parcele em até 12x no cartão ou pague no PIX com desconto.' 
    }
  ];

  const testimonials = [
    {
      name: 'Ana Beatriz',
      location: 'São Paulo, SP',
      product: 'Vestido Vintage Anos 80',
      text: 'Maria Clara tem um olhar único para peças especiais! Encontrei o vestido perfeito para meu evento.'
    },
    {
      name: 'Carolina Mendes', 
      location: 'Rio de Janeiro, RJ',
      product: 'Blusa Vintage Saint Laurent',
      text: 'A curadoria é impecável. Cada peça tem história e personalidade. Simplesmente apaixonada!'
    },
    {
      name: 'Juliana Santos',
      location: 'Belo Horizonte, MG',
      product: 'Consultoria de Styling',
      text: 'Além das peças incríveis, a consultoria de styling transformou meu guarda-roupa. Recomendo demais!'
    }
  ];

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isNew && (
          <Badge className="absolute top-3 left-3 bg-green-500 text-white">
            NOVO
          </Badge>
        )}
        {product.isOffer && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
            OFERTA
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-2">
          {product.tags.map((tag: string) => (
            <span 
              key={tag}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
        </div>
        {product.offerText && (
          <p className="text-sm font-medium text-red-600">
            {product.offerText}
          </p>
        )}
        <Button className="w-full">
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: "url('/banner/banner.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-headline mb-6 tracking-tight">
            We don't whisper.
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-4xl sm:text-6xl lg:text-7xl font-headline">We</span>
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
              <Image
                src="/logo_completa.svg"
                alt="RÜGE Logo"
                width={96}
                height={96}
                className="w-full h-full filter brightness-0 invert"
              />
            </div>
            <span className="text-4xl sm:text-6xl lg:text-7xl font-headline">.</span>
          </div>
          
          <Button 
            asChild 
            size="lg"
            className="bg-white text-black hover:bg-white/90 text-lg font-semibold px-8 py-4 rounded-full"
          >
            <Link href="/products">
              Clique para conhecer a coleção 🐆
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4 sm:mb-6">
              Curadoria Especial
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Peças Selecionadas
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tesouros únicos cuidadosamente garimpados para criar looks autênticos e atemporais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                Ver Toda Coleção
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Explore por Categoria
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Encontre Seu Estilo
            </p>
            <p className="text-muted-foreground mt-2">
              Navegue pelas nossas categorias cuidadosamente organizadas e descubra peças únicas que combinam com sua personalidade.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category) => (
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
                    <Link href={category.href}>
                      <span className="hidden sm:inline">Ver Todos</span>
                      <span className="sm:hidden">Ver</span>
                      <ArrowRight className="ml-1 sm:ml-2 w-3 sm:w-4 h-3 sm:h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-muted/30 to-accent/5 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4 sm:mb-6">
              Por que escolher a RÜGE?
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Qualidade que Você Pode Confiar
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Cada peça é cuidadosamente selecionada com dedicação, materiais de qualidade e técnicas modernas.
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
      </section>

      {/* New Products Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-green-100 text-green-800 border-green-200 mb-4 sm:mb-6">
              Novidades
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Recém-chegados! As últimas adições à nossa coleção cuidadosamente curada.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 mb-12">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products?filter=new">
                Ver Todas as Novidades
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Depoimentos
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              O que Nossos Clientes Dizem
            </p>
            <p className="text-muted-foreground mt-2">
              A satisfação dos nossos clientes é nossa maior recompensa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-muted-foreground mb-4">
                    "{testimonial.text}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    <div className="text-xs text-primary mt-1">{testimonial.product}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-red-100 text-red-800 border-red-200 mb-4 sm:mb-6">
              Promoções Especiais
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
              Ofertas imperdíveis por tempo limitado. Não perca!
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 mb-12">
            {promotionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products?filter=promotions">
                Ver Todas as Promoções
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

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

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline mb-4 sm:mb-6">
            Consultoria Personalizada
          </h2>
          <p className="text-lg sm:text-xl mb-8 sm:mb-12 opacity-90 max-w-3xl mx-auto">
            Transforme Seu Estilo com Maria Clara
          </p>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Consultoria de imagem personalizada para descobrir seu estilo único com acessórios vintage cuidadosamente selecionados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Button 
              asChild 
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full"
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
      </section>
    </div>
  );
}
