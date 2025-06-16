'use client';

// Importação dinâmica para evitar problemas de SSR
const heic2any = typeof window !== 'undefined' ? require('heic2any') : null;

/**
 * Utilitário para converter arquivos HEIC para JPEG/PNG
 */
export class HeicConverter {
  /**
   * Verifica se um arquivo é HEIC
   */
  static isHeicFile(file: File): boolean {
    return file.type === 'image/heic' || 
           file.type === 'image/heif' || 
           file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif');
  }

  /**
   * Verifica se uma URL é de um arquivo HEIC
   */
  static isHeicUrl(url: string): boolean {
    const urlLower = url.toLowerCase();
    return urlLower.includes('.heic') || urlLower.includes('.heif');
  }

  /**
   * Converte um arquivo HEIC para JPEG
   */
  static async convertHeicToJpeg(file: File, quality: number = 0.8): Promise<File> {
    if (!heic2any) {
      throw new Error('Conversão HEIC não disponível no servidor');
    }

    if (!this.isHeicFile(file)) {
      return file; // Se não for HEIC, retorna o arquivo original
    }

    try {
      console.log('🔄 Convertendo arquivo HEIC para JPEG...');
      
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: quality
      }) as Blob;

      // Criar novo arquivo com extensão .jpg
      const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      const convertedFile = new File([convertedBlob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      console.log('✅ Arquivo HEIC convertido com sucesso:', {
        original: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        converted: `${convertedFile.name} (${(convertedFile.size / 1024 / 1024).toFixed(2)}MB)`
      });

      return convertedFile;
    } catch (error) {
      console.error('❌ Erro ao converter arquivo HEIC:', error);
      throw new Error(`Falha na conversão do arquivo HEIC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Converte um arquivo HEIC para PNG (para imagens com transparência)
   */
  static async convertHeicToPng(file: File): Promise<File> {
    if (!heic2any) {
      throw new Error('Conversão HEIC não disponível no servidor');
    }

    if (!this.isHeicFile(file)) {
      return file;
    }

    try {
      console.log('🔄 Convertendo arquivo HEIC para PNG...');
      
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/png'
      }) as Blob;

      const fileName = file.name.replace(/\.(heic|heif)$/i, '.png');
      const convertedFile = new File([convertedBlob], fileName, {
        type: 'image/png',
        lastModified: Date.now()
      });

      console.log('✅ Arquivo HEIC convertido para PNG com sucesso');
      return convertedFile;
    } catch (error) {
      console.error('❌ Erro ao converter arquivo HEIC para PNG:', error);
      throw new Error(`Falha na conversão do arquivo HEIC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Converte múltiplos arquivos HEIC
   */
  static async convertMultipleHeicFiles(files: File[], toFormat: 'jpeg' | 'png' = 'jpeg'): Promise<File[]> {
    const convertedFiles: File[] = [];
    
    for (const file of files) {
      try {
        if (this.isHeicFile(file)) {
          const converted = toFormat === 'jpeg' 
            ? await this.convertHeicToJpeg(file)
            : await this.convertHeicToPng(file);
          convertedFiles.push(converted);
        } else {
          convertedFiles.push(file);
        }
      } catch (error) {
        console.error(`❌ Erro ao converter ${file.name}:`, error);
        // Adicionar o arquivo original mesmo se a conversão falhar
        convertedFiles.push(file);
      }
    }
    
    return convertedFiles;
  }

  /**
   * Cria uma URL de objeto para visualização de arquivo HEIC convertido
   */
  static async createPreviewUrl(file: File): Promise<string> {
    if (!this.isHeicFile(file)) {
      return URL.createObjectURL(file);
    }

    try {
      const convertedFile = await this.convertHeicToJpeg(file, 0.6); // Qualidade menor para preview
      return URL.createObjectURL(convertedFile);
    } catch (error) {
      console.error('❌ Erro ao criar preview do arquivo HEIC:', error);
      // Retorna uma imagem placeholder
      return '/products/placeholder.jpg';
    }
  }
}

export default HeicConverter;
