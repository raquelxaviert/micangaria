/**
 * Configurações do Supabase Storage
 * 
 * Este arquivo centraliza todas as configurações relacionadas ao armazenamento
 * de arquivos no Supabase Storage.
 */

import { createClient } from '@/lib/supabase/client';

export const STORAGE_CONFIG = {
  // Nome do bucket principal para imagens de produtos
  BUCKET_NAME: 'product-imgs',
  
  // Configurações de upload
  UPLOAD_OPTIONS: {
    cacheControl: '3600', // 1 hora
    upsert: false, // Não sobrescrever arquivos existentes
  },
  
  // Limites de tamanho
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB (limite do plano free)
  
  // Tipos de arquivo permitidos
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  
  // Configurações de transformação de imagem
  IMAGE_TRANSFORM: {
    enabled: true, // Image Transformation está habilitado no Supabase
    
    // Tamanhos predefinidos para otimização
    sizes: {
      thumbnail: { width: 150, height: 150 },
      card: { width: 400, height: 400 },
      carousel: { width: 800, height: 600 },
      zoom: { width: 1200, height: 900 },
      full: { width: 2000, height: 1500 }
    }
  }
};

/**
 * Gera URL otimizada do Supabase Storage com transformação de imagem
 */
export function getSupabaseImageUrl(
  fileName: string, 
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .getPublicUrl(fileName);
  
  let url = data.publicUrl;
  
  // Adicionar parâmetros de transformação se especificados
  if (options && STORAGE_CONFIG.IMAGE_TRANSFORM.enabled) {
    const params = new URLSearchParams();
    
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return url;
}

/**
 * Valida se um arquivo pode ser uploaded
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Verificar tamanho
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo permitido: ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  
  // Verificar tipo
  if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Gera um caminho único para o arquivo no Storage
 */
export function generateStoragePath(productId: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop() || 'jpg';
  return `products/${productId}/${timestamp}-${random}.${extension}`;
}

/**
 * Remove uma imagem do Supabase Storage
 */
export async function deleteStorageFile(filePath: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      return false;
    }
    
    console.log('✅ Arquivo deletado:', filePath);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    return false;
  }
}
