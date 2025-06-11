'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikes } from '@/contexts/LikesContextSupabase';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/ui/ClientOnly';

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
  const { toggleLike, isLiked, isLoaded } = useLikes();
  
  const liked = isLiked(productId);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Adicionar efeito de pulso no coração
    const target = e.currentTarget as HTMLElement;
    const heart = target.querySelector('svg');
    if (heart) {
      heart.style.animation = 'heartPulse 0.6s ease-out';
      setTimeout(() => {
        heart.style.animation = '';
      }, 600);
    }
    
    toggleLike(productId);
  };

  return (
    <ClientOnly>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleClick}        className={cn(
          "transition-all duration-500 ease-out group",
          variant === 'floating' && 
          "absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full shadow-md hover:shadow-lg border border-white/10 hover:border-red-200 hover:scale-110",
          liked && "text-red-500 hover:text-red-600 bg-red-50/80 border-red-200",
          !liked && "text-gray-400 hover:text-red-500 hover:bg-red-50/50",
          size === 'sm' && "w-7 h-7",
          size === 'md' && "w-8 h-8",
          size === 'lg' && "w-10 h-10",
          className
        )}
        title={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >        <Heart 
          className={cn(
            "transition-all duration-500 ease-out",
            size === 'sm' && "w-3 h-3",
            size === 'md' && "w-4 h-4", 
            size === 'lg' && "w-5 h-5",
            liked && "fill-current scale-110 drop-shadow-sm",
            !liked && "scale-100 group-hover:stroke-red-500 group-hover:stroke-2 group-hover:scale-105"
          )} 
        />
      </Button>
    </ClientOnly>
  );
}