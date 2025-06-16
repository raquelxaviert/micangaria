/**
 * Configurações do Supabase Storage
 * 
 * Este arquivo contém as configurações específicas do Storage do Supabase
 * incluindo limites, transformações de imagem e configurações S3.
 */

// Configurações do Storage
export const STORAGE_CONFIG = {
  // Limites de upload
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB em bytes
  MAX_FILE_SIZE_GB: 50, // 50GB limite máximo do Pro Plan
  
  // Bucket principal para imagens de produtos
  PRODUCT_IMAGES_BUCKET: 'product-images',
  
  // Configurações de transformação de imagem (quando habilitado)
  IMAGE_TRANSFORMATIONS: {
    // Tamanhos padrão para diferentes usos
    THUMBNAIL: { width: 150, height: 150, quality: 80 },
    CARD: { width: 400, height: 400, quality: 85 },
    CAROUSEL: { width: 800, height: 800, quality: 90 },
    ZOOM: { width: 1200, height: 1200, quality: 95 },
    
    // Formatos suportados
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    
    // Formato de saída preferido
    OUTPUT_FORMAT: 'webp' as const,
  },
  
  // Configurações S3 (para integração externa se necessário)
  S3_CONFIG: {
    endpoint: 'https://koduoglrfzronbcgqrjc.supabase.co/storage/v1/s3',
    region: 'sa-east-1',
    // Chaves de acesso (devem ser mantidas seguras em variáveis de ambiente)
    // ACCESS_KEY_ID: process.env.SUPABASE_S3_ACCESS_KEY_ID,
    // SECRET_ACCESS_KEY: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  },
  
  // Políticas de cache
  CACHE_CONTROL: {
    IMAGES: '31536000', // 1 ano para imagens
    THUMBNAILS: '2592000', // 30 dias para thumbnails
  },
  
  // Estrutura de pastas
  FOLDER_STRUCTURE: {
    PRODUCTS: 'products',
    TEMP: 'temp',
    BACKUPS: 'backups',
  }
};

/**
 * Gera URL do Supabase Storage com transformações (se disponível)
 */
export function getSupabaseImageUrl(
  filePath: string, 
  transformation?: 'THUMBNAIL' | 'CARD' | 'CAROUSEL' | 'ZOOM'
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const baseUrl = `${supabaseUrl}/storage/v1/object/public/${STORAGE_CONFIG.PRODUCT_IMAGES_BUCKET}/${filePath}`;
  
  // Se transformação de imagem estiver habilitada e especificada
  if (transformation) {
    const config = STORAGE_CONFIG.IMAGE_TRANSFORMATIONS[transformation];
    if (config && typeof config === 'object' && 'width' in config) {
      const params = new URLSearchParams({
        width: config.width.toString(),
        height: config.height.toString(),
        quality: config.quality.toString(),
        format: STORAGE_CONFIG.IMAGE_TRANSFORMATIONS.OUTPUT_FORMAT,
      });
      
      return `${baseUrl}?${params.toString()}`;
    }
  }
  
  return baseUrl;
}

/**
 * Valida se um arquivo pode ser enviado baseado nas configurações
 */
export function validateFileUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  // Verificar tamanho
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo permitido: ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  
  // Verificar formato
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !STORAGE_CONFIG.IMAGE_TRANSFORMATIONS.SUPPORTED_FORMATS.includes(extension)) {
    return {
      valid: false,
      error: `Formato não suportado. Use: ${STORAGE_CONFIG.IMAGE_TRANSFORMATIONS.SUPPORTED_FORMATS.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Gera nome único para arquivo no Storage
 */
export function generateStorageFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  const fileName = `${baseName}-${timestamp}-${random}.${extension}`;
  
  return prefix ? `${prefix}/${fileName}` : fileName;
}
