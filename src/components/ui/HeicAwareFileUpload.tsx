'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { HeicConverter } from '@/lib/heicConverter';

interface HeicAwareFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  maxFiles?: number;
}

/**
 * Componente de upload que detecta e converte automaticamente arquivos HEIC
 */
export function HeicAwareFileUpload({
  onFilesSelected,
  accept = "image/*",
  multiple = true,
  className,
  maxFiles = 5
}: HeicAwareFileUploadProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Para resetar o input

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Verificar se há arquivos HEIC
    const heicFiles = files.filter(file => HeicConverter.isHeicFile(file));
    const otherFiles = files.filter(file => !HeicConverter.isHeicFile(file));

    if (heicFiles.length > 0) {
      setIsConverting(true);
      setConversionStatus({ type: null, message: '' });

      try {
        console.log(`🔄 Convertendo ${heicFiles.length} arquivo(s) HEIC...`);
        
        // Converter arquivos HEIC
        const convertedFiles = await HeicConverter.convertMultipleHeicFiles(heicFiles, 'jpeg');
        
        // Combinar arquivos convertidos com os outros
        const allFiles = [...otherFiles, ...convertedFiles];
        
        // Limitar o número de arquivos se necessário
        const finalFiles = allFiles.slice(0, maxFiles);
        
        setConversionStatus({
          type: 'success',
          message: `✅ ${heicFiles.length} arquivo(s) HEIC convertido(s) com sucesso para JPEG!`
        });

        onFilesSelected(finalFiles);
        
      } catch (error) {
        console.error('❌ Erro na conversão HEIC:', error);
        
        setConversionStatus({
          type: 'error',
          message: `❌ Erro ao converter arquivos HEIC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
        
        // Em caso de erro, usar os arquivos originais
        onFilesSelected([...otherFiles, ...heicFiles].slice(0, maxFiles));
      } finally {
        setIsConverting(false);
        // Resetar o input para permitir selecionar os mesmos arquivos novamente
        setFileInputKey(Date.now());
      }
    } else {
      // Se não há arquivos HEIC, processar normalmente
      onFilesSelected(files.slice(0, maxFiles));
      setConversionStatus({ type: null, message: '' });
    }
  }, [onFilesSelected, maxFiles]);

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Input de arquivo */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isConverting}
            className="relative overflow-hidden"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Convertendo HEIC...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Imagens
              </>
            )}
            <input
              key={fileInputKey}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileChange}
              disabled={isConverting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </Button>
          
          {multiple && (
            <span className="text-xs text-muted-foreground">
              Máximo {maxFiles} arquivos
            </span>
          )}
        </div>

        {/* Status da conversão */}
        {conversionStatus.type && (
          <Alert 
            variant={conversionStatus.type === 'error' ? 'destructive' : 'default'}
            className={conversionStatus.type === 'success' ? 'border-green-200 bg-green-50' : ''}
          >
            {conversionStatus.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {conversionStatus.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {conversionStatus.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
            <AlertDescription className={conversionStatus.type === 'success' ? 'text-green-700' : ''}>
              {conversionStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Dica sobre formatos suportados */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <strong>Formatos suportados:</strong> JPG, PNG, WebP, GIF, SVG
          <br />
          <strong>Conversão automática:</strong> Arquivos HEIC serão convertidos para JPEG automaticamente
        </div>
      </div>
    </div>
  );
}

export default HeicAwareFileUpload;
