'use client';

interface LikeButtonProps {
  productId: string;
  className?: string;
  variant?: 'default' | 'floating';
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({ 
  productId, 
  className, 
  variant = 'floating',
  size = 'md'
}: LikeButtonProps) {
  // Componente desabilitado - não exibe mais o botão de favoritos
  return null;
}
