'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadTempProps {
  currentImage?: string;
  onImageChange: (imageData: { url: string; file?: File; isTemp?: boolean }) => void;
  accept?: string;
  maxSize?: number;
}

export default function ImageUploadTemp({ 
  currentImage, 
  onImageChange, 
  accept = 'image/*',
  maxSize = 5 
}: ImageUploadTempProps) {
  const [preview, setPreview] = useState<string | null>(currentImage && currentImage.trim() ? currentImage : null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [isTemp, setIsTemp] = useState(false);
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

    try {
      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // Armazenar arquivo temporariamente
      setTempFile(file);
      setIsTemp(true);
      
      // Gerar URL temporária para preview
      const tempUrl = URL.createObjectURL(file);
      
      // Notificar o formulário com os dados temporários
      onImageChange({ 
        url: tempUrl, 
        file: file, 
        isTemp: true 
      });
      
      console.log('📁 Arquivo armazenado temporariamente:', file.name);

    } catch (error: any) {
      console.error('❌ Erro ao processar arquivo:', error);
      alert(`Erro ao processar arquivo: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setTempFile(null);
    setIsTemp(false);
    onImageChange({ url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLocalImageSelect = (imagePath: string) => {
    setPreview(imagePath);
    setTempFile(null);
    setIsTemp(false);
    onImageChange({ url: imagePath, isTemp: false });
  };

  return (
    <div className="space-y-4">
      {/* Status do arquivo */}
      {isTemp && tempFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            📁 Arquivo selecionado: <strong>{tempFile.name}</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Será enviado para o Supabase quando você salvar o produto
          </p>
        </div>
      )}

      {/* Área de Upload */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          preview 
            ? isTemp 
              ? 'border-blue-300 bg-blue-50'
              : 'border-green-300 bg-green-50'
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

          {preview ? (
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
              <p className={`text-sm mt-2 ${isTemp ? 'text-blue-600' : 'text-green-600'}`}>
                {isTemp ? '📁 Arquivo selecionado' : '✓ Imagem local'}
              </p>
              <p className="text-xs text-gray-500">Clique para alterar</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Clique para selecionar imagem
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

      {/* Opções de Imagem Local */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Ou escolha uma imagem local:</p>
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
              onClick={() => handleLocalImageSelect(imagePath)}
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

      {/* Info sobre upload */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <strong>💡 Como funciona:</strong>
        </p>
        <ul className="text-xs text-gray-600 mt-1 space-y-1">
          <li>• Selecione um arquivo → fica armazenado temporariamente</li>
          <li>• Clique em "Salvar Produto" → arquivo é enviado para Supabase</li>
          <li>• Imagens locais são usadas imediatamente</li>
        </ul>
      </div>
    </div>
  );
}
