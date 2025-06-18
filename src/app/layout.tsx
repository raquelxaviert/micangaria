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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
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
          <>
            {children}
            <Footer />
            <Toaster />
          </>
        ) : (
          <ClientProviders>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 pt-28">
              {children}
            </main>
            <Footer />
            <Toaster />
          </ClientProviders>
        )}
      </body>
    </html>
  );
}
