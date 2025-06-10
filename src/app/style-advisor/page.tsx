'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, User, Phone, Star, Award } from 'lucide-react';
import Image from 'next/image';

export default function StyleAdvisorPage() {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-8 space-y-8">
      {/* Hero Section - Maria Clara */}
      <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-0">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Consultoria Personalizada
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline text-primary">
                  Consultoria de Imagem com Maria Clara
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Descubra e desenvolva seu estilo pessoal único com uma consultoria 
                  completamente personalizada para seu perfil e necessidades.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-muted-foreground">+20 consultorias</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Formação Denise Aguiar</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-muted-foreground">100% satisfação</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-secondary" />
                  <span className="text-muted-foreground">Atendimento VIP</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/maria.png"
                  alt="Maria Clara - Consultora de Imagem"
                  width={400}
                  height={500}
                  className="object-cover w-full h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-headline">Maria Clara</h3>
                  <p className="text-sm opacity-90">Consultora de Imagem & Personal Stylist</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Contact */}
      <Card className="shadow-xl bg-card border-0">
        <CardContent className="p-8 sm:p-12 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-headline text-primary">
              Pronta para Descobrir Seu Estilo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Converse diretamente com Maria Clara e inicie sua jornada de transformação 
              pessoal com uma consultoria completamente personalizada.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              asChild
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105"
            >
              <a 
                href="https://wa.me/5511999999999?text=Olá%20Maria%20Clara!%20Tenho%20interesse%20em%20uma%20consultoria%20de%20imagem%20personalizada.%20Gostaria%20de%20saber%20mais%20sobre%20o%20serviço."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <Phone className="mr-3 h-6 w-6" />
                Conversar com Maria Clara
              </a>
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Você será redirecionado para o WhatsApp
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
