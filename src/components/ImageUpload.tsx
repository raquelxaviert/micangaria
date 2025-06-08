'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  accept?: string;
  maxSize?: number; // em MB
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  accept = 'image/*',
  maxSize = 5 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      alert(`O arquivo deve ter no máximo ${maxSize}MB.`);
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        
        // Em um ambiente real, você faria upload para um serviço como:
        // 1. Cloudinary
        // 2. AWS S3
        // 3. Vercel Blob
        // 4. Supabase Storage
        
        // Por enquanto, vamos simular um upload e usar um URL local
        const simulatedUrl = `/products/${file.name}`;
        onImageChange(simulatedUrl);
      };
      reader.readAsDataURL(file);

      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-purple-400 bg-purple-50' 
            : preview 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </div>
          ) : preview ? (
            <div className="text-center">
              <div className="relative inline-block">
                <Image
                  src={preview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover max-h-48"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full p-1 w-6 h-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-green-600 mt-2">✓ Imagem carregada</p>
              <p className="text-xs text-gray-500">Clique para alterar</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                {isDragging ? (
                  <Upload className="w-6 h-6 text-purple-600" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragging ? 'Solte a imagem aqui' : 'Clique para fazer upload'}
              </p>
              <p className="text-xs text-gray-500">
                ou arraste e solte uma imagem
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Formatos aceitos: JPG, PNG, GIF (máx. {maxSize}MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opções de Imagem Rápida */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Ou escolha uma imagem existente:</p>
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
            <div
              key={index}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                preview === imagePath ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'
              }`}
              onClick={() => {
                setPreview(imagePath);
                onImageChange(imagePath);
              }}
            >
              <Image
                src={imagePath}
                alt={`Opção ${index + 1}`}
                width={80}
                height={80}
                className="object-cover aspect-square"
              />
              {preview === imagePath && (
                <div className="absolute inset-0 bg-purple-400 bg-opacity-20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dica de Upload Real */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica para Produção:</strong> Para usar upload real, integre com serviços como 
          Cloudinary, AWS S3, Vercel Blob ou Supabase Storage. 
          Por enquanto, coloque suas imagens na pasta <code className="bg-blue-100 px-1 rounded">/public/products/</code>
        </p>
      </div>
    </div>
  );
}
