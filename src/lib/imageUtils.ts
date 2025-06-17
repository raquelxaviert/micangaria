/**
 * Utilitários para otimização de imagens, especialmente Google Drive
 */

import { createClient } from './supabase/client';

export interface ImageSizeConfig {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Extrai o file ID de uma URL do Google Drive
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) {
    return null;
  }

  // Diferentes padrões de URL do Google Drive
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Gera URL otimizada do Google Drive para diferentes tamanhos e usos
 */
export function getOptimizedGoogleDriveUrl(
  url: string, 
  config: ImageSizeConfig = {}
): string {
  const fileId = extractGoogleDriveFileId(url);
  
  if (!fileId) {
    return url; // Retorna URL original se não for do Google Drive
  }

  const { width = 800, height = 800, quality = 90 } = config;

  const params = new URLSearchParams({
    id: fileId,
    export: 'view',
    ...(width && { w: width.toString() }),
    ...(height && { h: height.toString() }),
    ...(quality && { q: quality.toString() })
  });

  return `https://drive.google.com/uc?${params.toString()}`;
}

/**
 * Configurações predefinidas para diferentes contextos
 */
export const IMAGE_CONFIGS = {
  card: { width: 400, height: 400, quality: 85 },
  gallery: { width: 800, height: 800, quality: 90 },
  full: { width: 1200, height: 1200, quality: 95 }
};

/**
 * Pré-carrega uma imagem para melhorar a performance
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Pré-carrega múltiplas imagens
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => preloadImage(url));
  await Promise.allSettled(promises);
}

/**
 * Gera placeholder blur para melhorar UX durante carregamento
 */
export function generateBlurDataUrl(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Gradiente suave
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Verifica se uma URL é do Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage');
}

/**
 * Otimiza URLs de imagem, priorizando Supabase Storage sobre Google Drive
 * Se a URL for do Supabase, retorna ela diretamente (já otimizada)
 * Se for do Google Drive, aplica otimizações
 */
export function getOptimizedImageUrl(url: string, config: ImageSizeConfig): string {
  if (!url) return '/products/placeholder.jpg';
  
  // Se for URL do Supabase Storage, usar diretamente
  if (isSupabaseStorageUrl(url)) {
    return url;
  }
  
  // Se for do Google Drive, aplicar otimizações
  if (isGoogleDriveUrl(url)) {
    return getOptimizedGoogleDriveUrl(url, config);
  }
  
  // Se for outra URL, retornar como está
  return url;
}

function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

export async function transferImageFromGoogleDrive(driveUrl: string): Promise<string> {
  const supabase = createClient();
  
  try {
    // Verificar se já existe no Supabase
    const fileId = extractGoogleDriveFileId(driveUrl);
    if (!fileId) {
      console.error('❌ URL do Google Drive inválida:', driveUrl);
      return driveUrl;
    }

    const { data: existingFiles } = await supabase.storage
      .from('product-imgs')
      .list('products', {
        search: fileId
      });
    
    if (existingFiles && existingFiles.length > 0) {
      const { data: { publicUrl } } = supabase.storage
        .from('product-imgs')
        .getPublicUrl(`products/${existingFiles[0].name}`);
      return publicUrl;
    }
    
    // Se não existe, baixar e fazer upload
    const response = await fetch(driveUrl);
    if (!response.ok) throw new Error('Falha ao baixar imagem do Drive');
    
    const blob = await response.blob();
    const fileExt = blob.type.split('/')[1] || 'jpg';
    const fileName = `${fileId}.${fileExt}`;
    const filePath = `products/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-imgs')
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-imgs')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Erro ao transferir imagem:', error);
    return driveUrl;
  }
}

export async function transferMultipleImages(urls: string[]): Promise<string[]> {
  return Promise.all(
    urls.map(url => isGoogleDriveUrl(url) ? transferImageFromGoogleDrive(url) : url)
  );
}

export async function optimizeProductImages(product: any): Promise<any> {
  const supabase = createClient();
  
  try {
    // Preservar a ordem das imagens conforme definido no formulário
    const allImages = [
      product.image_url,
      ...(product.gallery_urls || [])
    ].filter(Boolean); // Remove URLs vazias/nulas

    // Transferir todas as imagens mantendo a ordem
    const optimizedUrls = await transferMultipleImages(allImages);

    // A primeira imagem é sempre a principal
    const optimizedImageUrl = optimizedUrls[0] || null;
    
    // As demais vão para a galeria
    const optimizedGalleryUrls = optimizedUrls.slice(1);

    // Atualizar produto mantendo a ordem
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        image_url: optimizedImageUrl,
        gallery_urls: optimizedGalleryUrls,
        images_optimized: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedProduct;
  } catch (error) {
    console.error('❌ Erro ao otimizar imagens do produto:', error);
    return product;
  }
}
