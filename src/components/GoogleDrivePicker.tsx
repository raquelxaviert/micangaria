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
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '1fp36hi2E9rLWIpW7AaegAi7i7MWn8Rvp';
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;

  // Converter ID do arquivo para URL pública
  const getPublicImageUrl = (fileId: string) => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  // Carregar arquivos da pasta do Google Drive
  const loadFiles = async () => {
    if (!API_KEY) {
      setError('Google Drive API Key não configurada. Verifique o arquivo .env.local');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = folderOnly 
        ? `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed=false`
        : `'${FOLDER_ID}' in parents and trashed=false`;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?` +
        `q=${encodeURIComponent(query)}&` +
        `key=${API_KEY}&` +
        `fields=files(id,name,mimeType,thumbnailLink,webViewLink,size,createdTime)&` +
        `orderBy=createdTime desc&` +
        `pageSize=100`
      );

      if (!response.ok) {
        throw new Error(`Erro da API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Filtrar apenas imagens
      const imageFiles = data.files?.filter((file: GoogleDriveFile) => 
        file.mimeType.startsWith('image/')
      ) || [];

      setFiles(imageFiles);
      console.log(`✅ Carregadas ${imageFiles.length} imagens do Google Drive`);
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar arquivos:', err);
      setError(err.message || 'Erro ao carregar arquivos do Google Drive');
    } finally {
      setLoading(false);
    }
  };

  // Carregar arquivos quando o dialog abrir
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  // Atualizar seleção inicial
  useEffect(() => {
    setCurrentSelection(selectedImages);
  }, [selectedImages]);

  // Filtrar arquivos por termo de busca
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Alternar seleção de arquivo
  const toggleSelection = (fileId: string) => {
    const url = getPublicImageUrl(fileId);
    
    if (currentSelection.includes(url)) {
      setCurrentSelection(prev => prev.filter(id => id !== url));
    } else {
      if (currentSelection.length >= maxImages) {
        alert(`Você pode selecionar no máximo ${maxImages} imagens.`);
        return;
      }
      setCurrentSelection(prev => [...prev, url]);
    }
  };

  // Confirmar seleção
  const handleConfirm = () => {
    onSelect(currentSelection);
    setIsOpen(false);
  };

  // Cancelar e reverter seleção
  const handleCancel = () => {
    setCurrentSelection(selectedImages);
    setIsOpen(false);
  };

  // Upload de imagem para o Google Drive
  const uploadToGoogleDrive = async (file: File) => {
    if (!API_KEY) {
      throw new Error('Google Drive API Key não configurada');
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Primeiro, fazer upload do arquivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Metadados do arquivo
      const metadata = {
        name: file.name,
        parents: [FOLDER_ID],
        mimeType: file.type
      };

      // Upload via multipart
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca e Controles */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar imagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadFiles} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Status */}
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

          {/* Grid de Imagens */}
          {!loading && !error && (
            <div className="max-h-96 overflow-y-auto">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma imagem encontrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                      >
                        <CardContent className="p-2">
                          <div className="aspect-square relative mb-2">
                            <Image
                              src={file.thumbnailLink || publicUrl}
                              alt={file.name}
                              fill
                              className="object-cover rounded"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
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
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {filteredFiles.length} imagens disponíveis
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={currentSelection.length === 0}>
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
