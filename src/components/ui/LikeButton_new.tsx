'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikes } from '@/contexts/LikesContext';
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
  const { toggleLike, isLiked } = useLikes();
  
  const liked = isLiked(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(productId);
  };

  const fallbackButton = (
    <Button 
      variant="ghost" 
      size="icon"
      className={cn(
        "transition-all duration-300",
        variant === 'floating' && 
        "absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full shadow-sm",
        className
      )}
      disabled
    >
      <Heart className={cn(
        size === 'sm' && "w-3 h-3",
        size === 'md' && "w-4 h-4", 
        size === 'lg' && "w-5 h-5"
      )} />
    </Button>
  );

  return (
    <ClientOnly fallback={fallbackButton}>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleClick}
        className={cn(
          "transition-all duration-300",
          variant === 'floating' && 
          "absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full shadow-sm",
          liked && "text-red-500 hover:text-red-600",
          !liked && "hover:text-red-500",
          className
        )}
        title={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart 
          className={cn(
            "transition-all duration-300",
            size === 'sm' && "w-3 h-3",
            size === 'md' && "w-4 h-4", 
            size === 'lg' && "w-5 h-5",
            liked && "fill-current scale-110",
            !liked && "scale-100"
          )} 
        />
      </Button>
    </ClientOnly>
  );
}
