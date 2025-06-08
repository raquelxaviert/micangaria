import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, Star, Compass, Users, Award, Instagram, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <header className="text-center py-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl">
        <Badge className="bg-accent/15 text-accent-foreground border-accent/30 mb-6">
          ✨ Nossa História ✨
        </Badge>        <h1 className="text-5xl md:text-6xl font-headline text-primary mb-6">
          Conhece a Maria Clara
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Uma jornada de descoberta pessoal que transformou paixão em propósito
        </p>
      </header>

      {/* Maria Clara's Story */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">          <Image 
            src="/maria.png" 
            alt="Maria Clara - Fundadora da Miçangaria" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-semibold">Maria Clara</p>
            <p className="text-sm opacity-90">Fundadora & Curadora</p>
          </div>
        </div>
        
        <div className="space-y-8 order-1 lg:order-2">
          <div className="space-y-6">
            <h2 className="text-4xl font-headline text-primary">
              Da Academia aos Acessórios
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Olá! Eu sou a Maria Clara, e esta é a história de como descobri minha verdadeira paixão. 
              Por anos, dediquei minha vida ao fitness como <span className="text-primary font-semibold">personal trainer</span>, 
              ajudando pessoas a transformarem seus corpos e suas vidas.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Mas desde pequena, sempre fui <span className="text-secondary font-semibold">apaixonada por moda</span>. 
              Passava horas folheando revistas, criando looks e sonhando com peças únicas que contassem histórias. 
              Era como se houvesse uma parte de mim que sempre soube que um dia seguiria esse caminho.
            </p>            <p className="text-lg leading-relaxed text-muted-foreground">
              A Miçangaria nasceu quando finalmente decidi <span className="text-accent font-semibold">perseguir essa paixão</span>. 
              Descobri que uma das coisas que mais amo fazer é <span className="text-primary font-semibold">procurar e curar peças especiais</span> 
              - acessórios únicos que capturam a essência do estilo boho e celebram nossa rica cultura brasileira.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-primary">Paixão</p>
                  <p className="text-sm text-muted-foreground">Desde criança</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-secondary/5 border-secondary/20">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-semibold text-secondary">Propósito</p>
                  <p className="text-sm text-muted-foreground">Encontrar o único</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="space-y-12">
        <div className="text-center">          <h2 className="text-4xl font-headline text-primary mb-6">
            Minha Missão com a Miçangaria
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cada peça que escolho carrega uma história, uma emoção, um pedacinho de arte que merece ser celebrado.
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
            Por que Escolher a Miçangaria?
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
            A Miçangaria é minha forma de compartilhar essa paixão com você, oferecendo não apenas acessórios, 
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
              <p className="text-sm text-muted-foreground">Fundadora da Miçangaria</p>
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
                Consultor de Estilo AI
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
