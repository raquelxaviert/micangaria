'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Folder, Image as ImageIcon, Search, Check, X, RefreshCw, Upload, Plus } from 'lucide-react';
import Image from 'next/image';
import { getOptimizedGoogleDriveUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink: string;
  size?: string;
  createdTime: string;
}

interface GoogleDrivePickerProps {
  onSelect: (selectedImages: string[]) => void;
  selectedImages?: string[];
  maxImages?: number;
  folderOnly?: boolean;
}

export default function GoogleDrivePicker({ 
  onSelect, 
  selectedImages = [], 
  maxImages = 5,
  folderOnly = false 
}: GoogleDrivePickerProps) {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp';
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;

  // Reset selection quando o modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setCurrentSelection(selectedImages);
    }
  }, [isOpen, selectedImages]);

  // Função para pré-carregar imagens
  const preloadImage = (url: string): Promise<void> => {
    if (preloadedImages.has(url)) return Promise.resolve();
    
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, url]));
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  };

  // Pré-carregar imagens quando os arquivos são carregados
  useEffect(() => {
    const preloadImages = async () => {
      if (files.length > 0) {
        // Primeiro, pré-carregar miniaturas
        const thumbnailPromises = files.map(file => 
          preloadImage(getThumbnailUrl(file.id))
        );
        await Promise.all(thumbnailPromises);

        // Depois, pré-carregar imagens em tamanho maior para as selecionadas
        const selectedPromises = currentSelection.map(url => 
          preloadImage(url)
        );
        await Promise.all(selectedPromises);
      }
    };

    preloadImages();
  }, [files, currentSelection]);

  // Converter ID do arquivo para URL pública otimizada
  const getPublicImageUrl = (fileId: string) => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  // Gerar thumbnail otimizado (tamanho menor para carregamento mais rápido)
  const getThumbnailUrl = (fileId: string, size: number = 200) => {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  };

  // Carregar arquivos da pasta do Google Drive (otimizado)
  const loadFiles = async () => {
    if (!API_KEY) {
      setError('Google Drive API Key não configurada. Verifique o arquivo .env.local');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando arquivos do Google Drive...');
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size,createdTime)&key=${API_KEY}&pageSize=1000`
      );
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Apenas imagens (filtro duplo para garantir)
      const imageFiles = data.files?.filter((file: GoogleDriveFile) => 
        file.mimeType.startsWith('image/') && 
        !file.name.toLowerCase().includes('.tmp') // Excluir arquivos temporários
      ) || [];

      setFiles(imageFiles);
      console.log(`✅ Carregadas ${imageFiles.length} imagens do Google Drive (otimizado)`);
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar arquivos:', err);
      setError(err.message || 'Erro ao carregar arquivos do Google Drive');
    } finally {
      setLoading(false);
    }
  };

  // Carregar arquivos quando o componente montar
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  // Filtrar arquivos baseado na busca
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handles para seleção
  const handleImageSelect = (fileId: string) => {
    const imageUrl = getPublicImageUrl(fileId);
    
    if (currentSelection.includes(imageUrl)) {
      setCurrentSelection(currentSelection.filter(url => url !== imageUrl));
    } else if (currentSelection.length < maxImages) {
      setCurrentSelection([...currentSelection, imageUrl]);
    }
  };

  const handleConfirm = () => {
    onSelect(currentSelection);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setCurrentSelection(selectedImages);
    setIsOpen(false);
  };

  // Função para lidar com seleção de arquivos
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newTemporaryImages: string[] = [];
      
      for (const file of Array.from(selectedFiles)) {
        // Criar preview temporário usando URL.createObjectURL
        const tempUrl = URL.createObjectURL(file);
        newTemporaryImages.push(tempUrl);
        
        console.log(`✅ ${file.name} preparado para upload!`);
      }
      
      // Adicionar imagens temporárias à seleção atual
      if (newTemporaryImages.length > 0) {
        const updatedSelection = [...currentSelection, ...newTemporaryImages].slice(0, maxImages);
        setCurrentSelection(updatedSelection);
        
        // Mostrar instrução para fazer upload manual
        setError(
          `${newTemporaryImages.length} imagem(s) preparada(s)! ` +
          'Para finalizar, você precisará fazer upload manual para o Google Drive na pasta de produtos e depois recarregar esta lista.'
        );
      }
      
      // Limpar input
      event.target.value = '';
      
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      setError(error.message || 'Erro ao preparar as imagens');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Folder className="w-4 h-4 mr-2" />
          Selecionar do Google Drive
          {selectedImages.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedImages.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="fixed inset-0 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-full h-full sm:w-[95vw] sm:max-w-4xl sm:h-[85vh] sm:max-h-[85vh] p-4 sm:p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Selecionar Imagens do Google Drive</span>
            <Badge variant="outline" className="text-xs">
              {currentSelection.length}/{maxImages}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca e Controles */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar imagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            <div className="flex gap-2 justify-end sm:justify-start">
              {/* Botão de Upload */}
              <div className="relative" title="Adicionar novas imagens">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button variant="outline" disabled={uploading} className="relative" size="sm">
                  {uploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline ml-1">Upload</span>
                </Button>
              </div>

              {/* Botão de Recarregar */}
              <Button
                variant="outline"
                onClick={loadFiles}
                disabled={loading}
                size="sm"
                title="Recarregar lista de imagens"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-1">Recarregar</span>
              </Button>

              {/* Botão para Abrir Google Drive */}
              <Button
                variant="outline"
                onClick={() => window.open(`https://drive.google.com/drive/folders/${FOLDER_ID}`, '_blank')}
                size="sm"
                title="Abrir pasta no Google Drive"
              >
                <Folder className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Abrir Drive</span>
              </Button>
            </div>
          </div>

          {/* Estado de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Estado de Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-gray-600">Carregando imagens...</p>
              </div>
            </div>
          )}

          {/* Lista de Arquivos */}
          {!loading && !error && (
            <div className="space-y-2">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma imagem encontrada</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {searchTerm ? `Nenhuma imagem corresponde a "${searchTerm}"` : 'A pasta não contém imagens'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://drive.google.com/drive/folders/${FOLDER_ID}`, '_blank')}
                    size="sm"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    Abrir Google Drive
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredFiles.map((file) => {
                    const imageUrl = getPublicImageUrl(file.id);
                    const isSelected = currentSelection.includes(imageUrl);
                    const isMaxReached = !isSelected && currentSelection.length >= maxImages;

                    return (
                      <Card
                        key={file.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 shadow-lg' 
                            : isMaxReached 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:ring-1 hover:ring-gray-300'
                        }`}
                        onClick={() => !isMaxReached && handleImageSelect(file.id)}
                      >
                        <CardContent className="p-2">
                          <div className="relative aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                            {!imageLoadErrors.has(file.id) ? (
                              <Image
                                src={getOptimizedGoogleDriveUrl(imageUrl, IMAGE_CONFIGS.thumbnail)}
                                alt={file.name}
                                fill
                                className="object-cover"
                                sizes="120px"
                                quality={75}
                                priority={currentSelection.includes(imageUrl)}
                                onLoadingComplete={() => {
                                  setLoadedImages(prev => new Set([...prev, file.id]));
                                  // Pré-carregar a versão maior da imagem se estiver selecionada
                                  if (currentSelection.includes(imageUrl)) {
                                    preloadImage(imageUrl);
                                  }
                                }}
                                onError={() => setImageLoadErrors(prev => new Set([...prev, file.id]))}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 z-10">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate" title={file.name}>
                            {file.name}
                          </p>
                          {file.size && (
                            <p className="text-xs text-gray-400">
                              {(parseInt(file.size) / 1024 / 1024).toFixed(1)} MB
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t gap-3">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {filteredFiles.length} imagens disponíveis
            </div>
            <div className="flex gap-2 justify-center sm:justify-end">
              <Button variant="outline" onClick={handleCancel} size="sm">
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={currentSelection.length === 0} size="sm">
                <Check className="w-4 h-4 mr-1" />
                Confirmar ({currentSelection.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
