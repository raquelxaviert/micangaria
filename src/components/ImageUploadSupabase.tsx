'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Image as ImageIcon, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

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
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
    setUploadSuccess(false);

    try {
      // Upload para Supabase Storage
      const supabase = createClient();
      
      // Gerar nome único para arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('🚀 Iniciando upload para Supabase Storage...');
      
      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('❌ Erro no upload para Supabase:', error);
        throw error;
      }
      
      console.log('✅ Arquivo enviado para Supabase:', data?.path);
      
      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      console.log('🔗 URL pública gerada:', publicUrl);
      
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
      
      // Passar URL pública para o formulário
      onImageChange(publicUrl);
      setUploadSuccess(true);
      
      // Mostrar sucesso por 3 segundos
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      alert(`Erro ao fazer upload da imagem: ${error}`);
      
      // Fallback: mostrar preview local mas usar URL de fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        // Usar nome original como fallback
        const fallbackUrl = `/products/${file.name}`;
        onImageChange(fallbackUrl);
      };
      reader.readAsDataURL(file);
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
    setUploadSuccess(false);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <Card 
        className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragging 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : preview 
              ? uploadSuccess 
                ? 'border-green-400 bg-green-50'
                : 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-blue-600 font-medium">Enviando para Supabase Storage...</p>
              <p className="text-xs text-gray-500 mt-1">Aguarde, fazendo upload da imagem</p>
            </div>
          ) : preview ? (
            <div className="text-center">
              <div className="relative inline-block">
                <Image
                  src={preview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover max-h-48 shadow-md"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full p-1 w-7 h-7 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                {uploadSuccess && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              {uploadSuccess ? (
                <div className="mt-3">
                  <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Upload realizado com sucesso!
                  </p>
                  <p className="text-xs text-gray-500">Imagem salva no Supabase Storage</p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm text-blue-600 font-medium">✓ Imagem carregada</p>
                  <p className="text-xs text-gray-500">Clique para alterar</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {isDragging ? (
                  <Upload className="w-8 h-8 text-blue-600" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-base font-medium text-gray-700 mb-2">
                {isDragging ? 'Solte a imagem aqui' : 'Upload direto para Supabase'}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Clique ou arraste uma imagem
              </p>
              <p className="text-xs text-gray-400">
                Formatos: JPG, PNG, WEBP (máx. {maxSize}MB)
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
                preview === imagePath ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => {
                setPreview(imagePath);
                onImageChange(imagePath);
                setUploadSuccess(false);
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
                <div className="absolute inset-0 bg-blue-400 bg-opacity-20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info sobre Upload */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Upload className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              Upload Direto para Supabase Storage
            </p>
            <p className="text-xs text-blue-700">
              As imagens são enviadas automaticamente para o Supabase Storage com URLs permanentes.
              Em caso de erro, use as opções locais acima como fallback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
