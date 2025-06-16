'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Folder, Image as ImageIcon, Search, Check, X, RefreshCw, Upload, Plus } from 'lucide-react';
import Image from 'next/image';

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
  onSelect: (images: string[]) => void;
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
  const [error, setError] = useState<string | null>(null);  const [searchTerm, setSearchTerm] = useState('');
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedImages);
  const [isOpen, setIsOpen] = useState(false);  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp';
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
  // Converter ID do arquivo para URL pÃºblica otimizada
  const getPublicImageUrl = (fileId: string) => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  // Gerar thumbnail otimizado (tamanho menor para carregamento mais rÃ¡pido)
  const getThumbnailUrl = (fileId: string, size: number = 200) => {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  };
  // Carregar arquivos da pasta do Google Drive (otimizado)
  const loadFiles = async () => {
    if (!API_KEY) {
      setError('Google Drive API Key nÃ£o configurada. Verifique o arquivo .env.local');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query otimizada - apenas imagens, menos campos
      const query = `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed=false`;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?` +
        `q=${encodeURIComponent(query)}&` +
        `key=${API_KEY}&` +
        // Campos mÃ­nimos necessÃ¡rios para melhor performance
        `fields=files(id,name,mimeType,size,createdTime)&` +
        `orderBy=createdTime desc&` +
        // Reduzir para 50 itens iniciais para carregamento mais rÃ¡pido
        `pageSize=50`
      );

      if (!response.ok) {
        throw new Error(`Erro da API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }      // Apenas imagens (filtro duplo para garantir)
      const imageFiles = data.files?.filter((file: GoogleDriveFile) => 
        file.mimeType.startsWith('image/') && 
        !file.name.toLowerCase().includes('.tmp') // Excluir arquivos temporÃ¡rios
      ) || [];

      setFiles(imageFiles);
      console.log(`âœ… Carregadas ${imageFiles.length} imagens do Google Drive (otimizado)`);
      
    } catch (err: any) {
      console.error('âŒ Erro ao carregar arquivos:', err);
      setError(err.message || 'Erro ao carregar arquivos do Google Drive');
    } finally {
      setLoading(false);
    }
  };

  // Limpar cache de imagens
  const clearImageCache = () => {
    setLoadedImages(new Set());
    setImageLoadErrors(new Set());
  };

  // Carregar arquivos quando o dialog abrir
  useEffect(() => {
    if (isOpen) {
      clearImageCache(); // Limpar cache ao abrir
      loadFiles();
    }
  }, [isOpen]);

  // Atualizar seleÃ§Ã£o inicial
  useEffect(() => {
    setCurrentSelection(selectedImages);
  }, [selectedImages]);

  // Filtrar arquivos por termo de busca
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Alternar seleÃ§Ã£o de arquivo
  const toggleSelection = (fileId: string) => {
    const url = getPublicImageUrl(fileId);
    
    if (currentSelection.includes(url)) {
      setCurrentSelection(prev => prev.filter(id => id !== url));
    } else {
      if (currentSelection.length >= maxImages) {
        alert(`VocÃª pode selecionar no mÃ¡ximo ${maxImages} imagens.`);
        return;
      }
      setCurrentSelection(prev => [...prev, url]);
    }
  };

  // Confirmar seleÃ§Ã£o
  const handleConfirm = () => {
    onSelect(currentSelection);
    setIsOpen(false);
  };

  // Cancelar e reverter seleÃ§Ã£o
  const handleCancel = () => {
    setCurrentSelection(selectedImages);
    setIsOpen(false);
  };
  // Upload temporÃ¡rio local - o usuÃ¡rio farÃ¡ upload manual para Google Drive
  const uploadTemporary = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Criar uma URL temporÃ¡ria para preview
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  // FunÃ§Ã£o para lidar com seleÃ§Ã£o de arquivos
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newTemporaryImages: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Verificar se Ã© imagem
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} nÃ£o Ã© uma imagem vÃ¡lida.`);
          continue;
        }

        // Verificar tamanho (mÃ¡ximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} Ã© muito grande. MÃ¡ximo 10MB.`);
          continue;
        }

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
        
        // Criar preview temporÃ¡rio
        const tempUrl = await uploadTemporary(file);
        newTemporaryImages.push(tempUrl);
        
        console.log(`âœ… ${file.name} preparado para upload!`);
      }
      
      // Adicionar imagens temporÃ¡rias Ã  seleÃ§Ã£o atual
      if (newTemporaryImages.length > 0) {
        const updatedSelection = [...currentSelection, ...newTemporaryImages].slice(0, maxImages);
        setCurrentSelection(updatedSelection);
        
        // Mostrar instruÃ§Ã£o para fazer upload manual
        setError(
          `${newTemporaryImages.length} imagem(s) preparada(s)! ` +
          'Para finalizar, vocÃª precisarÃ¡ fazer upload manual para o Google Drive na pasta de produtos e depois recarregar esta lista.'
        );
      }
      
      // Limpar input
      event.target.value = '';
      
    } catch (error: any) {
      console.error('âŒ Erro no upload:', error);
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
          </DialogTitle>        </DialogHeader>

        <div className="space-y-4">
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
              {/* BotÃ£o de Upload */}
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
                  <span className="sr-only">Adicionar imagens</span>
                </Button>
              </div>
              
              <Button variant="outline" onClick={loadFiles} disabled={loading} title="Recarregar imagens" size="sm">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.open(`https://drive.google.com/drive/folders/${FOLDER_ID}`, '_blank')}
                title="Abrir pasta no Google Drive"
                size="sm"
              >
                <Folder className="w-4 h-4" />
              </Button>
            </div>
          </div>{/* Progress do Upload */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Preparando imagens...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* InstruÃ§Ãµes para Upload Manual */}
          {!loading && !error && files.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Folder className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Como adicionar novas imagens:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Clique no botÃ£o <strong>+</strong> para selecionar imagens do seu computador</li>
                    <li>Acesse sua pasta do Google Drive de produtos</li>
                    <li>FaÃ§a upload manual das imagens selecionadas</li>
                    <li>Clique no botÃ£o de recarregar para ver as novas imagens</li>
                  </ol>
                </div>
              </div>
            </div>
          )}          {/* Status e Performance */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando imagens...</span>
            </div>
          )}

          {/* InformaÃ§Ãµes de Performance */}
          {!loading && !error && files.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs text-green-800">
                âš¡ Carregamento otimizado: {files.length} imagens â€¢ Thumbnails 200px â€¢ Lazy loading ativo
              </p>
            </div>
          )}

          {/* Grid de Imagens */}
          {!loading && !error && (
            <div className="max-h-96 overflow-y-auto">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma imagem encontrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {filteredFiles.map((file) => {
                    const publicUrl = getPublicImageUrl(file.id);
                    const isSelected = currentSelection.includes(publicUrl);
                    
                    return (
                      <Card 
                        key={file.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => toggleSelection(file.id)}
                      >                        <CardContent className="p-2">
                          <div className="aspect-square relative mb-2">
                            <Image
                              src={getThumbnailUrl(file.id, 200)}
                              alt={file.name}
                              fill
                              className="object-cover rounded transition-opacity duration-200"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                              onLoad={() => {
                                setLoadedImages(prev => new Set([...prev, file.id]));
                              }}
                              onError={() => {
                                setImageLoadErrors(prev => new Set([...prev, file.id]));
                              }}
                            />
                            
                            {/* Loading indicator */}
                            {!loadedImages.has(file.id) && !imageLoadErrors.has(file.id) && (
                              <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                              </div>
                            )}
                            
                            {/* Error fallback */}
                            {imageLoadErrors.has(file.id) && (
                              <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
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
          )}          {/* BotÃµes de AÃ§Ã£o */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t gap-3">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {filteredFiles.length} imagens disponÃ­veis
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
