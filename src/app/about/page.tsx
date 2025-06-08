import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Feather, Sun } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <header className="text-center py-8">
        <h1 className="text-5xl font-headline text-primary mb-4">About Miçangueria</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Celebrating culture, craftsmanship, and the vibrant spirit of boho and indigenous art.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-square md:aspect-auto md:h-[500px] rounded-lg overflow-hidden shadow-xl">
          <Image 
            src="https://placehold.co/600x500.png" 
            alt="Artisan crafting accessories" 
            layout="fill" 
            objectFit="cover"
            data-ai-hint="artisan crafting" 
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-headline text-primary">Our Story</h2>
          <p className="text-lg leading-relaxed">
            Miçangueria was born from a deep appreciation for the rich artistic traditions of indigenous cultures and the free-spirited beauty of boho style. We believe that accessories are more than just adornments; they are expressions of identity, heritage, and personal stories.
          </p>
          <p className="text-lg leading-relaxed">
            Our journey began with travels through vibrant communities, connecting with talented artisans who pour their heart and soul into every piece. We were captivated by their intricate beadwork, natural materials, and the stories woven into their creations.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-headline text-primary text-center">Our Mission</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center shadow-lg">
            <CardHeader>
              <Heart className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-xl">Empower Artisans</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We partner directly with artisans, ensuring fair compensation and supporting the preservation of traditional crafts.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardHeader>
              <Feather className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-xl">Curate Uniqueness</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Each piece in our collection is carefully selected for its quality, beauty, and the unique story it tells.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardHeader>
              <Sun className="mx-auto h-10 w-10 text-accent mb-2" />
              <CardTitle className="font-headline text-xl">Inspire Self-Expression</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We aim to provide accessories that help you express your individual style and connect with a global tapestry of art.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 md:text-left text-center md:flex md:items-center md:gap-8">
        <div className="relative w-full md:w-1/2 aspect-video md:h-[400px] rounded-lg overflow-hidden shadow-xl mx-auto md:mx-0">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Inspirational patterns and textures" 
            layout="fill" 
            objectFit="cover"
            data-ai-hint="patterns textures" 
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-headline text-primary">Our Inspiration</h2>
          <p className="text-lg leading-relaxed mt-4">
            We are inspired by the raw beauty of nature, the sun-baked earth, the vibrant hues of tropical flora, and the deep blues of the ocean. The intricate patterns found in indigenous art, the flowing forms of boho design, and the stories passed down through generations fuel our passion. We seek to bring a piece of this inspiration to you through our curated collection.
          </p>
        </div>
      </section>
    </div>
  );
}
