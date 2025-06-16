'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminProductSkeletonProps {
  className?: string;
}

/**
 * Skeleton loading para cards de produto no admin
 * Usado para melhorar a percepção de performance durante carregamento
 */
export function AdminProductSkeleton({ className }: AdminProductSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Skeleton da imagem */}
      <div className="aspect-square bg-muted/50 animate-pulse" />
      
      {/* Skeleton do conteúdo */}
      <CardContent className="p-4 space-y-3">
        {/* Título */}
        <div className="space-y-2">
          <div className="h-5 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 bg-muted/30 rounded w-3/4 animate-pulse" />
        </div>
        
        {/* Preço */}
        <div className="space-y-1">
          <div className="h-6 bg-muted/50 rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-muted/30 rounded w-1/3 animate-pulse" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 bg-muted/30 rounded w-16 animate-pulse" />
          <div className="h-5 bg-muted/30 rounded w-12 animate-pulse" />
          <div className="h-5 bg-muted/30 rounded w-20 animate-pulse" />
        </div>
        
        {/* Botões */}
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-muted/30 rounded flex-1 animate-pulse" />
          <div className="h-8 bg-muted/30 rounded w-10 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid de skeletons para múltiplos produtos
 */
interface AdminProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function AdminProductGridSkeleton({ 
  count = 6, 
  className 
}: AdminProductGridSkeletonProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <AdminProductSkeleton key={index} />
      ))}
    </div>
  );
}

export default AdminProductSkeleton;
