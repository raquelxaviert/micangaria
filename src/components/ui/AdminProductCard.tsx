'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Package } from 'lucide-react';
import { AdminImageCard } from '@/components/ui/AdminImageCard';
import { Product } from '@/lib/placeholder-data';

interface AdminProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  children?: React.ReactNode; // Para o formulário de edição
}

/**
 * Card otimizado para exibição de produtos no painel admin
 * Características:
 * - Lazy loading de imagens otimizado
 * - Priorização da imagem principal (gallery_urls[0])
 * - Feedback visual melhorado
 * - Responsividade otimizada
 * - Memoização para performance
 */
const AdminProductCard = memo(({ 
  product, 
  onEdit, 
  onDelete, 
  children 
}: AdminProductCardProps) => {
  
  // Determinar a imagem principal prioritariamente
  const getMainImage = () => {
    if (product.gallery_urls && product.gallery_urls.length > 0) {
      return product.gallery_urls[0];
    }
    return product.imageUrl || product.image_url || '/products/placeholder.jpg';
  };

  const mainImage = getMainImage();
  const hasValidImage = mainImage && mainImage !== '/products/placeholder.jpg';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Container da imagem */}
      <div className="aspect-square relative bg-muted/30">
        {hasValidImage ? (
          <AdminImageCard
            src={mainImage}
            alt={product.name}
            className="group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <Package className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Badges de status */}
        <div className="absolute top-2 right-2 flex gap-1 flex-col">
          {product.isNewArrival && (
            <Badge className="bg-green-500 text-white text-xs shadow-sm">
              NOVO
            </Badge>
          )}
          {product.isPromotion && (
            <Badge className="bg-red-500 text-white text-xs shadow-sm">
              OFERTA
            </Badge>
          )}
          {!product.is_active && (
            <Badge variant="secondary" className="text-xs shadow-sm">
              INATIVO
            </Badge>
          )}
        </div>

        {/* Indicador de múltiplas imagens */}
        {product.gallery_urls && product.gallery_urls.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            +{product.gallery_urls.length - 1} fotos
          </div>
        )}
      </div>

      {/* Conteúdo do card */}      <CardContent className="p-4 space-y-3">        {/* Título e categoria */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="text-sm text-muted-foreground capitalize flex items-center gap-2">
            <span>{product.type} • {product.style}</span>
            {product.sku && (
              <Badge variant="outline" className="text-xs">
                {product.sku}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Preços */}
        <div className="space-y-1">
          <div className="text-xl font-bold text-primary">
            R$ {product.price.toFixed(2)}
          </div>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="text-sm text-muted-foreground line-through">
              De: R$ {product.compare_at_price.toFixed(2)}
            </div>
          )}
          {product.cost_price && (
            <div className="text-xs text-muted-foreground">
              Custo: R$ {product.cost_price.toFixed(2)}
            </div>
          )}
        </div>

        {/* Tags rápidas */}
        <div className="flex flex-wrap gap-1">
          {product.colors?.slice(0, 3).map((color, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {color}
            </Badge>
          ))}
          {product.colors?.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{product.colors.length - 3}
            </span>
          )}
        </div>        {/* Status do estoque */}
        {product.track_inventory && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Estoque:</span>
            <Badge 
              variant={(product.quantity || 0) > 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {product.quantity || 0} unidades
            </Badge>
          </div>
        )}
        
        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="fixed inset-0 m-auto w-[95vw] max-h-[90vh] overflow-y-auto sm:inset-auto sm:left-1/2 sm:top-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Produto</DialogTitle>
              </DialogHeader>
              {children}
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 hover:border-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

AdminProductCard.displayName = 'AdminProductCard';

export default AdminProductCard;
