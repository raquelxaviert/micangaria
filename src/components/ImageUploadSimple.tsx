'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadSimpleProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  accept?: string;
  maxSize?: number;
}

export default function ImageUploadSimple({ 
  currentImage, 
  onImageChange, 
  accept = 'image/*',
  maxSize = 5 
}: ImageUploadSimpleProps) {
  const [preview, setPreview] = useState<string | null>(currentImage && currentImage.trim() ? currentImage : null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
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
    setUploadStatus('Preparando upload...');

    try {
      // Criar preview local primeiro
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // Gerar nome único para arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      setUploadStatus('Conectando com Supabase...');

      // Import dinâmico do Supabase
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      setUploadStatus('Fazendo upload...');
      
      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });      if (error) {
        // Extrair mensagem de erro de forma mais robusta
        const errorMessage = error?.message || (error as any)?.error_description || (error as any)?.details || JSON.stringify(error) || 'Erro desconhecido';
        console.error('❌ Erro no upload Supabase:', { 
          error, 
          message: errorMessage,
          details: error
        });
        setUploadStatus(`Erro: ${errorMessage}`);
        
        // Fallback: usar imagem local
        const localUrl = `/products/${file.name}`;
        onImageChange(localUrl);
          setTimeout(() => {
          alert(`⚠️ Upload para Supabase falhou: ${errorMessage}\n\nUsando imagem local como fallback.`);
          setUploadStatus('');
          // Limpar preview após fallback
          setPreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1000);
        
      } else {
        console.log('✅ Upload bem-sucedido:', data);
        setUploadStatus('Gerando URL...');
        
        // URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
            console.log('✅ URL pública:', publicUrl);
        onImageChange(publicUrl);
        
        setUploadStatus('Upload concluído!');
        setTimeout(() => {
          alert('✅ Imagem enviada para Supabase Storage com sucesso!');
          setUploadStatus('');
          // Limpar preview após upload bem-sucedido
          setPreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1000);
      }    } catch (error: any) {
      console.error('❌ Erro geral:', { 
        error, 
        message: error?.message,
        toString: error?.toString?.(),
        stack: error?.stack 
      });
      const errorMsg = error?.message || error?.toString?.() || 'Erro desconhecido no upload';
      setUploadStatus(`Erro: ${errorMsg}`);
      
      // Fallback: usar imagem local
      const localUrl = `/products/${file.name}`;
      onImageChange(localUrl);
        setTimeout(() => {
        alert(`❌ Erro no upload: ${errorMsg}\n\nUsando imagem local como fallback.`);
        setUploadStatus('');
        // Limpar preview após erro
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
      
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    setUploadStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Status do upload */}
      {uploadStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">📡 {uploadStatus}</p>
        </div>
      )}

      {/* Área de Upload */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          preview 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
        onClick={handleClick}
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
              {uploadStatus && <p className="text-xs text-gray-500 mt-1">{uploadStatus}</p>}
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
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                📤 Clique para fazer upload
              </p>
              <p className="text-xs text-gray-500">
                Envio direto para Supabase Storage
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, GIF (máx. {maxSize}MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opções de Imagem Local */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Ou use uma imagem local:</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            '/products/colar.jpg',
            '/products/brinco.jpg',
            '/products/pulseira.jpg',
            '/products/anel.jpg'
          ].map((imagePath, index) => (
            <div
              key={index}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                preview === imagePath ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'
              }`}
              onClick={() => {
                setPreview(imagePath);
                onImageChange(imagePath);
                setUploadStatus('');
              }}
            >
              <Image
                src={imagePath}
                alt={`Local ${index + 1}`}
                width={80}
                height={80}
                className="object-cover aspect-square"
              />
              {preview === imagePath && (
                <div className="absolute inset-0 bg-purple-400 bg-opacity-20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
