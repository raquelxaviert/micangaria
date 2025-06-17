'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Plus, Move, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { uploadImageToSupabase } from '@/lib/uploadUtils';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

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
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar items quando images mudar
  useEffect(() => {
    setImageItems(images.map(url => ({ url })));
  }, [images]);

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
      if (file.size > maxSize * 1024 * 1024) {
        alert(`O arquivo ${file.name} excede o tamanho máximo de ${maxSize}MB`);
        continue;
      }

      const tempItem: ImageItem = {
        url: URL.createObjectURL(file),
        isUploading: true,
        isTemp: true,
        file
      };

      setImageItems(prev => [...prev, tempItem]);

      try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from('product-imgs')
          .upload(`temp/${Date.now()}-${file.name}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('product-imgs')
          .getPublicUrl(data.path);

        setImageItems(prev => 
          prev.map(item => 
            item.url === tempItem.url 
              ? { ...item, url: publicUrl, isUploading: false, isTemp: false }
              : item
          )
        );

        updateParent(imageItems.map(item => 
          item.url === tempItem.url ? publicUrl : item.url
        ));

      } catch (error) {
        console.error('Erro no upload:', error);
        setImageItems(prev => prev.filter(item => item.url !== tempItem.url));
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
    updateParent(newItems.map(item => item.url));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageItems.length) return;
    
    const newItems = [...imageItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    setImageItems(newItems);
    updateParent(newItems.map(item => item.url));
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
    <div className="space-y-4">
      {/* Lista de Imagens */}
      {imageItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {imageItems.map((item, index) => (
            <Card key={item.url} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={getOptimizedImageUrl(item.url, IMAGE_CONFIGS.card)}
                    alt={`Imagem ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  
                  {/* Overlay com controles */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-white hover:bg-white/20"
                        onClick={() => moveImageUp(index)}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {index < imageItems.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-white hover:bg-white/20"
                        onClick={() => moveImageDown(index)}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-white hover:bg-white/20"
                        onClick={() => makeImagePrimary(index)}
                      >
                        <Move className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Badge de carregamento */}
                  {item.isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {/* Badge de posição */}
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{imageItems.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Área de Upload */}
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
    </div>
  );
}
