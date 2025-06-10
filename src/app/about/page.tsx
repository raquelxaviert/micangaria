import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, Star, Compass, Users, Award, Instagram, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}      <header className="text-center py-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl">
        <Badge className="bg-accent/15 text-accent-foreground border-accent/30 mb-6">
          🦁 Nossa História 🦁
        </Badge>        <h1 className="text-5xl md:text-6xl font-headline text-primary mb-6">
          RÜGE - Maria Clara
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Força, presença, originalidade, sofisticação e autenticidade em cada peça vintage
        </p>
      </header>

      {/* Maria Clara's Story */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">        <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">          <Image 
            src="/maria.png" 
            alt="Maria Clara - Fundadora do RÜGE" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-semibold">Maria Clara</p>
            <p className="text-sm opacity-90">Consultora de Imagem & Styling</p>
          </div>
        </div>
          <div className="space-y-8 order-1 lg:order-2">
          <div className="space-y-6">
            <h2 className="text-4xl font-headline text-primary">
              RÜGE - O Rugir da Autenticidade
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Olá! Eu sou a Maria Clara, tenho 27 anos e sou apaixonada por moda desde pequena. 
              <span className="text-primary font-semibold"> RÜGE</span> vem do rugir da onça, 
              e do "rouge" francês, que significa vermelho. Uma mistura de força, presença, 
              originalidade, sofisticação e autenticidade.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Estou me formando agora em <span className="text-secondary font-semibold">consultoria de imagem e styling</span>. 
              Sempre amei a parte de pesquisa e curadoria, tanto pra mim quanto para as minhas amigas. 
              Descobri um universo de possibilidades e preciosidades em brechós, e hoje, 
              grande parte do meu acervo pessoal são peças usadas.
            </p>            <p className="text-lg leading-relaxed text-muted-foreground">
              Para mim, <span className="text-accent font-semibold">se vestir deve ser sinônimo de autenticidade</span>. 
              Então, meu propósito com o brechó RÜGE é trazer uma seleção para além do meu armário. 
              Serão peças super especiais, únicas, ousadas, atemporais, inesperadas, e muito vintage.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground text-primary font-semibold italic">
              Roar 🦁
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-primary">Vintage</p>
                  <p className="text-sm text-muted-foreground">Peças únicas</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-secondary/5 border-secondary/20">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-semibold text-secondary">Styling</p>
                  <p className="text-sm text-muted-foreground">Consultoria especializada</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="space-y-12">        <div className="text-center">          <h2 className="text-4xl font-headline text-primary mb-6">
            Minha Missão com o RÜGE
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cada peça que escolho carrega uma história, uma personalidade e a força da autenticidade vintage.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-primary/5 border-0">
            <CardHeader>
              <Sparkles className="mx-auto h-12 w-12 text-accent mb-4" />
              <CardTitle className="font-headline text-xl text-primary">Curadoria Especial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Cada acessório é escolhido a dedo, pensando na mulher única que vai usá-lo. 
                Não vendemos apenas produtos, compartilhamos descobertas especiais.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-secondary/5 border-0">
            <CardHeader>
              <Compass className="mx-auto h-12 w-12 text-secondary mb-4" />
              <CardTitle className="font-headline text-xl text-primary">Estilo Autêntico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Acredito que moda é sobre expressar quem você é. Por isso, busco peças que 
                celebram a individualidade e o espírito livre do estilo boho brasileiro.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-accent/5 border-0">
            <CardHeader>
              <Users className="mx-auto h-12 w-12 text-accent mb-4" />
              <CardTitle className="font-headline text-xl text-primary">Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Mais que uma loja, somos uma comunidade de mulheres que valorizam qualidade, 
                originalidade e a arte de se expressar através dos acessórios.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-r from-muted/30 to-accent/5 py-16 rounded-3xl">
        <div className="text-center mb-12">          <h2 className="text-4xl font-headline text-primary mb-6">
            Por que Escolher a RÜGE?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Minha experiência como personal trainer me ensinou a importância do cuidado, da dedicação e do atendimento personalizado.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-headline text-lg text-primary">Qualidade Comprovada</h3>
            <p className="text-muted-foreground text-sm">
              Cada peça passa pelo meu olhar criterioso antes de chegar até você.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-headline text-lg text-primary">Atendimento Pessoal</h3>
            <p className="text-muted-foreground text-sm">
              Como personal trainer, aprendi que cada pessoa é única e merece atenção especial.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-headline text-lg text-primary">Peças Exclusivas</h3>
            <p className="text-muted-foreground text-sm">
              Passo horas procurando tesouros únicos que você não encontra em qualquer lugar.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-headline text-lg text-primary">Paixão Genuína</h3>
            <p className="text-muted-foreground text-sm">
              Cada peça é escolhida com o mesmo carinho que eu gostaria de receber.
            </p>
          </div>
        </div>
      </section>

      {/* Personal Message */}
      <section className="text-center space-y-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-headline text-primary mb-8">
            Uma Mensagem Pessoal
          </h2>          <blockquote className="text-xl italic text-muted-foreground leading-relaxed mb-8 border-l-4 border-accent pl-8">
            "Acredito que quando você encontra algo que realmente ama fazer, não é trabalho - é paixão. 
            A RÜGE é minha forma de compartilhar essa paixão com você, oferecendo não apenas acessórios, 
            mas pequenos tesouros que fazem seus olhos brilharem da mesma forma que os meus brilham quando os encontro."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 relative rounded-full overflow-hidden">
              <Image 
                src="/maria.png" 
                alt="Maria Clara" 
                fill
                className="object-cover"
              />
            </div>            <div className="text-left">
              <p className="font-semibold text-primary">Maria Clara</p>
              <p className="text-sm text-muted-foreground">Fundadora da RÜGE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 rounded-3xl">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-headline text-primary mb-6">
            Vamos Conversar?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Adoro conhecer as histórias das minhas clientes! Entre em contato comigo para dicas de estilo, 
            perguntas sobre as peças ou só para bater um papo sobre moda.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full"
            >
              <Link href="/style-advisor">
                <Sparkles className="mr-2 h-5 w-5" />
                Consultoria de Styling
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-4 rounded-full"
            >
              <Link href="/products">
                <Heart className="mr-2 h-5 w-5" />
                Ver Minha Coleção
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-center items-center gap-8 pt-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">São Paulo, Brasil</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">contato@micangueria.com</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
