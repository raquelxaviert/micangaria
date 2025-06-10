'use client';

import Image from 'next/image';
import Link from 'next/link';

export function SimpleHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-center">
          <Link href="/" className="hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.svg"
              alt="RÜGE"
              width={140}
              height={60}
              className="w-auto h-12 sm:h-14"
              priority
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
