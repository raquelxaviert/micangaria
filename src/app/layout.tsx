import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/global/Header';
import { Footer } from '@/components/global/Footer';
import { Toaster } from "@/components/ui/toaster";
import { LikesProvider } from '@/contexts/LikesContext';

export const metadata: Metadata = {
  title: 'RÜGE - Brechó Vintage & Styling',
  description: 'Peças únicas, ousadas e atemporais. Consultoria de imagem e styling por Maria Clara.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>      <body className="font-body antialiased flex flex-col min-h-screen">
        <LikesProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </LikesProvider>
        <Toaster />
      </body>
    </html>
  );
}
