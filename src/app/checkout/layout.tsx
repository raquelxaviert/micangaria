'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado para checkout */}
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.svg"
                alt="RÜGE"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>
      
      {children}
    </div>
  );
}
