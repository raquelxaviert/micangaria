import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Feather, Sun } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <header className="text-center py-8">
        <h1 className="text-5xl font-headline text-primary mb-4">Sobre a Miçangueria</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Celebrando cultura, artesanato e o espírito vibrante da arte boho e indígena.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-square md:aspect-auto md:h-[500px] rounded-lg overflow-hidden shadow-xl">
          <Image 
            src="https://placehold.co/600x500.png" 
            alt="Artesã criando acessórios" 
            layout="fill" 
            objectFit="cover"
            data-ai-hint="artisan crafting" 
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-headline text-primary">Nossa História</h2>
          <p className="text-lg leading-relaxed">
            A Miçangueria nasceu de uma profunda apreciação pelas ricas tradições artísticas das culturas indígenas e pela beleza de espírito livre do estilo boho. Acreditamos que os acessórios são mais do que simples adornos; são expressões de identidade, herança e histórias pessoais.
          </p>
          <p className="text-lg leading-relaxed">
            Nossa jornada começou com viagens por comunidades vibrantes, conectando-nos com artesãos talentosos que colocam seu coração e alma em cada peça. Fomos cativados por seus intrincados trabalhos com miçangas, materiais naturais e as histórias tecidas em suas criações.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-headline text-primary text-center">Nossa Missão</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center shadow-lg bg-card">
            <CardHeader>
              <Heart className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-xl">Empoderar Artesãos</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Fazemos parceria diretamente com artesãos, garantindo remuneração justa e apoiando a preservação do artesanato tradicional.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg bg-card">
            <CardHeader>
              <Feather className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-xl">Curar Singularidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Cada peça em nossa coleção é cuidadosamente selecionada por sua qualidade, beleza e pela história única que conta.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg bg-card">
            <CardHeader>
              <Sun className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-xl">Inspirar Autoexpressão</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Nosso objetivo é fornecer acessórios que ajudem você a expressar seu estilo individual e se conectar com uma tapeçaria global de arte.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 md:text-left text-center md:flex md:items-center md:gap-8">
        <div className="relative w-full md:w-1/2 aspect-video md:h-[400px] rounded-lg overflow-hidden shadow-xl mx-auto md:mx-0">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Padrões e texturas inspiradoras" 
            layout="fill" 
            objectFit="cover"
            data-ai-hint="patterns textures" 
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-headline text-primary">Nossa Inspiração</h2>
          <p className="text-lg leading-relaxed mt-4">
            Somos inspirados pela beleza bruta da natureza, a terra banhada pelo sol, as tonalidades vibrantes da flora tropical e os azuis profundos do oceano. Os padrões intrincados encontrados na arte indígena, as formas fluidas do design boho e as histórias passadas de geração em geração alimentam nossa paixão. Buscamos trazer um pedaço dessa inspiração para você através de nossa coleção curada.
          </p>
        </div>
      </section>
    </div>
  );
}
