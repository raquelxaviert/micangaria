'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LikedProductsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de produtos
    router.replace('/products');
  }, [router]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}
