'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Plus, Move, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { uploadImageToSupabase } from '@/lib/uploadUtils';
import { getOptimizedGoogleDriveUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  accept?: string;
  maxSize?: number; // em MB
}

interface ImageItem {
  url: string;
  isUploading?: boolean;
  isTemp?: boolean;
  file?: File;
}

export function MultiImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  accept = 'image/*',
  maxSize = 5 
}: MultiImageUploadProps) {
  const [imageItems, setImageItems] = useState<ImageItem[]>(
    images.map(url => ({ url }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateParent = (items: ImageItem[]) => {
    const urls = items.map(item => item.url);
    onImagesChange(urls);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const remainingSlots = maxImages - imageItems.length;
    const filesToProcess = newFiles.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        continue;
      }

      // Validar tamanho
      if (file.size > maxSize * 1024 * 1024) {
        alert(`O arquivo ${file.name} deve ter no máximo ${maxSize}MB.`);
        continue;
      }

      // Criar preview temporário
      const tempItem: ImageItem = {
        url: URL.createObjectURL(file),
        isUploading: true,
        isTemp: true,
        file
      };

      const newItems = [...imageItems, tempItem];
      setImageItems(newItems);

      try {
        // Upload para Supabase
        const uploadResult = await uploadImageToSupabase(file);
          if (uploadResult.success && uploadResult.url) {
          // Substituir item temporário pelo final
          const updatedItems = imageItems.map(item => 
            item.url === tempItem.url 
              ? { url: uploadResult.url!, isUploading: false, isTemp: false }
              : item
          );
          // Não duplicar - apenas atualizar o item existente
          setImageItems(updatedItems);
          updateParent(updatedItems);
        } else {
          // Upload falhou, usar imagem local
          const fallbackUrl = `/products/${file.name}`;
          const updatedItems = imageItems.map(item => 
            item.url === tempItem.url 
              ? { url: fallbackUrl, isUploading: false, isTemp: false }
              : item
          );
          setImageItems(updatedItems);
          updateParent(updatedItems);
          alert(`Upload falhou: ${uploadResult.error}. Usando imagem local como fallback.`);
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        // Remover item que falhou
        const filteredItems = imageItems.filter(item => item.url !== tempItem.url);
        setImageItems(filteredItems);
        updateParent(filteredItems);
        alert(`Erro ao fazer upload de ${file.name}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newItems = imageItems.filter((_, i) => i !== index);
    setImageItems(newItems);
    updateParent(newItems);
  };
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageItems.length) return;
    
    const newItems = [...imageItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    setImageItems(newItems);
    updateParent(newItems);
  };

  const moveImageUp = (index: number) => {
    if (index > 0) {
      moveImage(index, index - 1);
    }
  };

  const moveImageDown = (index: number) => {
    if (index < imageItems.length - 1) {
      moveImage(index, index + 1);
    }
  };

  const makeImagePrimary = (index: number) => {
    if (index === 0) return; // Já é a primeira
    moveImage(index, 0);
  };

  const handleClick = () => {
    if (imageItems.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">      {/* Existing Images */}
      {imageItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Imagens do Produto ({imageItems.length}/{maxImages})
            </h4>
            <div className="text-xs text-gray-500">
              Arraste ou use as setas para reordenar
            </div>
          </div>
          
          <div className="space-y-3">
            {imageItems.map((item, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-3">
                    {/* Image Preview */}                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={getOptimizedGoogleDriveUrl(item.url, IMAGE_CONFIGS.thumbnail)}
                        alt={`Produto ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="80px"
                        quality={75}
                      />
                      
                      {/* Loading overlay */}
                      {item.isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}

                      {/* Primary image indicator */}
                      {index === 0 && (
                        <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                          Principal
                        </div>
                      )}
                    </div>

                    {/* Image Info and Controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium truncate">
                            Imagem {index + 1}
                            {index === 0 && <span className="text-primary ml-1">(Principal)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.isUploading ? 'Enviando...' : 'Pronta'}
                          </p>
                        </div>

                        {/* Move Controls */}
                        <div className="flex items-center gap-1">
                          {/* Drag handle */}
                          <div className="p-1 cursor-move text-gray-400 hover:text-gray-600">
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* Up/Down buttons */}
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => moveImageUp(index)}
                              disabled={index === 0}
                              title="Mover para cima"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => moveImageDown(index)}
                              disabled={index === imageItems.length - 1}
                              title="Mover para baixo"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Make primary button */}
                          {index !== 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => makeImagePrimary(index)}
                              title="Tornar principal"
                            >
                              Principal
                            </Button>
                          )}
                          
                          {/* Remove button */}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeImage(index)}
                            title="Remover imagem"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {imageItems.length < maxImages && (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {isDragging ? (
                  <Upload className="w-8 h-8 text-blue-600" />
                ) : (
                  <Plus className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <p className="text-base font-medium text-gray-700 mb-2">
                {isDragging ? 'Solte as imagens aqui' : 'Adicionar mais imagens'}
              </p>
              
              <p className="text-sm text-gray-500 mb-1">
                Clique ou arraste imagens para enviar
              </p>
              
              <p className="text-xs text-gray-400">
                {imageItems.length}/{maxImages} imagens • Máx. {maxSize}MB cada
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Select from Existing */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Ou selecione imagens existentes:</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            '/products/colar.jpg',
            '/products/brinco.jpg',
            '/products/pulseira.jpg',
            '/products/anel.jpg',
            '/products/conjunto_colares.jpg',
            '/products/conjunto_pulseiras.jpg',
            '/products/sandalia.jpg',
            '/products/cinto.jpg'
          ].map((imagePath, index) => (
            <button
              key={index}
              type="button"
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                imageItems.some(item => item.url === imagePath)
                  ? 'border-blue-400 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => {
                if (imageItems.length < maxImages && !imageItems.some(item => item.url === imagePath)) {
                  const newItems = [...imageItems, { url: imagePath }];
                  setImageItems(newItems);
                  updateParent(newItems);
                }
              }}
              disabled={imageItems.length >= maxImages}
            >              <Image
                src={getOptimizedGoogleDriveUrl(imagePath, IMAGE_CONFIGS.thumbnail)}
                alt={`Opção ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                quality={75}
              />
              {imageItems.some(item => item.url === imagePath) && (
                <div className="absolute inset-0 bg-blue-400 bg-opacity-30 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <ImageIcon className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              Múltiplas Imagens por Produto
            </p>
            <p className="text-xs text-blue-700">
              • A primeira imagem será exibida como principal nos cards de produto<br />
              • Use as setas para reordenar as imagens<br />
              • Upload automático para Supabase Storage com URLs permanentes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
