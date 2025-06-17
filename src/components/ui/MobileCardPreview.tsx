'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FastImage } from '@/components/ui/FastImage';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface MobileCardPreviewProps {
  product: {
    name: string;
    price: number;
    image_url?: string;
    type?: string;
    style?: string;
    materials?: string[];
    is_new_arrival?: boolean;
    is_on_sale?: boolean;
    promotion_text?: string;
  };
  onPositionChange?: (position: { x: number; y: number }) => void;
  initialPosition?: { x: number; y: number };
}

export function MobileCardPreview({ product, onPositionChange, initialPosition }: MobileCardPreviewProps) {
  const [objectPositionX, setObjectPositionX] = useState(initialPosition?.x || 50); // 0-100%
  const [objectPositionY, setObjectPositionY] = useState(initialPosition?.y || 50); // 0-100%

  const handlePositionChange = (axis: 'x' | 'y', value: number[]) => {
    const newValue = value[0];
    if (axis === 'x') {
      setObjectPositionX(newValue);
    } else {
      setObjectPositionY(newValue);
    }
    
    onPositionChange?.({
      x: axis === 'x' ? newValue : objectPositionX,
      y: axis === 'y' ? newValue : objectPositionY
    });
  };

  const imageUrl = product.image_url || '/products/placeholder.jpg';
  const optimizedImageUrl = getOptimizedImageUrl(imageUrl, IMAGE_CONFIGS.card);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">📱 Preview Mobile Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">        {/* Mobile Card Preview */}
        <div className="w-full max-w-[120px] mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95">
            <div className="relative">              {/* Container menor para melhor visualização no mobile */}
              <div className="relative w-full overflow-hidden bg-gray-100" style={{ paddingTop: '100%' }}>
                <img
                  src={optimizedImageUrl}
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-contain bg-gray-50"
                  style={{
                    objectPosition: `${objectPositionX}% ${objectPositionY}%`
                  }}
                />
              </div>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_new_arrival && (
                  <Badge className="bg-green-500 text-white font-medium shadow-md text-xs px-2 py-0.5">
                    NOVO
                  </Badge>
                )}
                {product.is_on_sale && (
                  <Badge className="bg-red-500 text-white font-medium shadow-md text-xs px-2 py-0.5">
                    {product.promotion_text || 'OFERTA'}
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-3 space-y-2">
              {/* Badges de material/tipo */}
              <div className="flex items-center gap-1 flex-wrap mb-2">
                {product.materials && product.materials.length > 0 && (
                  <Badge variant="outline" className="capitalize text-xs leading-none px-1.5 py-0.5 h-5">
                    {product.materials[0]}
                  </Badge>
                )}
                {product.type && (
                  <Badge variant="outline" className="capitalize text-xs leading-none px-1.5 py-0.5 h-5">
                    {product.type}
                  </Badge>
                )}
              </div>
              
              {/* Nome e preço */}
              <div>
                <h3 className="font-medium text-sm line-clamp-2 leading-tight mb-1">
                  {product.name || 'Nome do Produto'}
                </h3>
                <p className="text-lg font-bold text-primary">
                  R$ {(product.price || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Posicionamento */}
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Posição Horizontal: {objectPositionX}%
            </Label>
            <Slider
              value={[objectPositionX]}
              onValueChange={(value) => handlePositionChange('x', value)}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Esquerda</span>
              <span>Centro</span>
              <span>Direita</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Posição Vertical: {objectPositionY}%
            </Label>
            <Slider
              value={[objectPositionY]}
              onValueChange={(value) => handlePositionChange('y', value)}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Topo</span>
              <span>Centro</span>
              <span>Base</span>
            </div>
          </div>          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Dica:</p>
            <p>Ajuste a posição para destacar a melhor parte do produto. No mobile, a imagem se ajusta completamente ao container quadrado sem cortes.</p>
          </div>

          <Button
            onClick={() => {
              setObjectPositionX(50);
              setObjectPositionY(50);
              onPositionChange?.({ x: 50, y: 50 });
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Resetar para Centro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
