import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/global/Header';
import { Footer } from '@/components/global/Footer';
import { Toaster } from "@/components/ui/toaster";
import { ClientProviders } from '@/components/providers/ClientProviders';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'RÜGE - Brechó Vintage & Styling',
  description: 'Peças únicas, ousadas e atemporais. Consultoria de imagem e styling por Maria Clara.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isCheckoutPage = pathname.startsWith('/checkout');

  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="font-body antialiased flex flex-col min-h-screen"
        suppressHydrationWarning={true}
      >
        {isCheckoutPage ? (
          // Layout simplificado para checkout sem contextos
          <>
            {children}
            <Footer />
            <Toaster />
          </>        ) : (
          // Layout completo para outras páginas
          <ClientProviders>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </ClientProviders>
        )}
        <Toaster />
      </body>
    </html>
  );
}
