'use client';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <>      {/* CSS customizado só para esta página - esconde tudo do header exceto a logo */}
      <style jsx global>{`
        /* Esconde TODOS os elementos do header */
        header button,
        header form,
        header nav,
        header ul,
        header input,
        header .flex.items-center.gap-2,
        header .flex.items-center.gap-3,
        header .flex.items-center.gap-4,
        header .space-y-4 {
          display: none !important;
        }
        
        /* Esconde a logo padrão */
        header a[href="/"] {
          display: none !important;
        }
        
        /* Centraliza o header inteiro e limpa tudo */
        header .container {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          position: relative !important;
        }
        
        /* Remove todos os divs filhos */
        header .container > * {
          display: none !important;
        }
        
        /* Adiciona a logo completa como conteúdo único do header */
        header .container::before {
          content: '';
          display: block !important;
          width: 180px;
          height: 60px;
          background-image: url('/logo_completa.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          margin: 0 auto;
        }
      `}</style>
      
      <div className="min-h-screen">{/* Hero Section */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0">
          {/* Banner para desktop */}
          <Image
            src="/banner/banner.png"
            alt="Banner de acessórios boho"
            fill
            className="object-cover hidden md:block"
            priority
          />
          {/* Banner para mobile */}
          <Image
            src="/banner/banner_mobile.png"
            alt="Banner de acessórios boho mobile"
            fill
            className="object-cover block md:hidden"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 text-center">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 bg-background/60 backdrop-blur-[2px] p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
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
          </div>
        </div>
      </section>      {/* Coming Soon Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline text-primary leading-tight animate-color-wave">
            Algo incrível está chegando...
          </h2>        </div>
      </section>
    </div>
  </>
  );
}