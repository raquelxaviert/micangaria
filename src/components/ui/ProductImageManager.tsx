'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageReorder } from '@/components/ui/ImageReorder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowUpDown, Save, Image as ImageIcon } from 'lucide-react';

interface ProductImageManagerProps {
  productId: string;
  images: string[];
  onUpdateImages: (newImages: string[]) => void;
  isUpdating?: boolean;
}

export function ProductImageManager({
  productId,
  images,
  onUpdateImages,
  isUpdating = false
}: ProductImageManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempImages, setTempImages] = useState<string[]>(images);

  const handleSaveOrder = async () => {
    try {
      console.log('💾 Salvando nova ordem das imagens para produto:', productId);
      
      // Aqui você pode adicionar lógica para salvar no banco de dados
      // Por exemplo, chamando uma API para atualizar o produto
      
      await onUpdateImages(tempImages);
      setIsDialogOpen(false);
      
      console.log('✅ Ordem das imagens salva com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar ordem das imagens:', error);
    }
  };

  const handleCancel = () => {
    setTempImages(images); // Reverte para a ordem original
    setIsDialogOpen(false);
  };

  if (images.length <= 1) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            {images.length === 0 ? 'Nenhuma imagem disponível' : 'Apenas uma imagem disponível'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Adicione mais imagens para poder reordená-las
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gerenciar Imagens
          </span>
          <Badge variant="secondary">
            {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Organize a ordem das imagens do produto. A primeira imagem será exibida como principal.
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reordenar Imagens
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reordenar Imagens do Produto</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <ImageReorder
                  images={tempImages}
                  onReorder={setTempImages}
                  className="w-full"
                />
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveOrder}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Ordem
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente mais simples para uso em linha
interface InlineImageReorderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  maxHeight?: string;
}

export function InlineImageReorder({ 
  images, 
  onChange, 
  maxHeight = "400px" 
}: InlineImageReorderProps) {
  if (images.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Arraste para reordenar ({images.length} imagens)
        </span>
      </div>
      
      <div style={{ maxHeight }} className="overflow-y-auto">
        <ImageReorder
          images={images}
          onReorder={onChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
