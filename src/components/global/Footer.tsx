
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-muted text-muted-foreground py-8 mt-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Links das políticas */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/privacy-policy" 
              className="hover:text-foreground transition-colors underline"
            >
              Política de Privacidade
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link 
              href="/terms-of-service" 
              className="hover:text-foreground transition-colors underline"
            >
              Termos de Serviço
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p>&copy; {currentYear ?? new Date().getFullYear()} RÜGE. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Inspirado na cultura, feito com amor.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
