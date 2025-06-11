'use client';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShoppingBag, Heart, Star, Truck, Shield, CreditCard, RefreshCw, Sparkles } from 'lucide-react';
import CollectionSection from '@/components/CollectionSection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden flex-1 min-h-screen flex items-center">
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
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 text-center">
          {/* Container interno com blur menor para facilitar leitura */}
          <div className="max-w-5xl mx-auto space-y-6 bg-background/70 backdrop-blur-[3px] p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl">
            <div className="space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-headline leading-tight animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
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
              
              {/* Texto "Algo incrível está chegando..." */}
              <div className="mt-12 sm:mt-16">
                <p className="text-xl sm:text-2xl md:text-3xl font-medium text-primary/90 mb-4">
                  Algo incrível está chegando...
                </p>
                <p className="text-sm sm:text-base text-muted-foreground/80">
                  Aguarde, em breve teremos novidades especiais para você ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
