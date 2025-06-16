/**
 * Utilitários para otimização de imagens, especialmente Google Drive
 */

export interface ImageSizeConfig {
  width?: number;
  height?: number;
  quality?: number;
  crop?: boolean;
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

  const { width = 800, height = 800, quality = 90, crop = true } = config;

  // Para thumbnails pequenos (miniaturas)
  if (width <= 100) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w100-h100-c`;
  }

  // Para miniaturas médias (cards)
  if (width <= 400) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400-c`;
  }

  // Para imagens grandes (visualização principal)
  if (width <= 800) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h800-c`;
  }

  // Para imagens muito grandes (zoom)
  if (width > 800) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200-h1200-c`;
  }

  // Fallback para URL original otimizada
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Configurações predefinidas para diferentes contextos
 */
export const IMAGE_CONFIGS = {
  thumbnail: { width: 100, height: 100, crop: true },
  card: { width: 400, height: 400, crop: true },
  carousel: { width: 800, height: 800, crop: true },
  zoom: { width: 1200, height: 1200, crop: true },
  hero: { width: 1600, height: 1200, crop: false },
} as const;

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
  return url.includes('.supabase.co/storage/v1/object/public/');
}

/**
 * Otimiza URLs de imagem, priorizando Supabase Storage sobre Google Drive
 * Se a URL for do Supabase, retorna ela diretamente (já otimizada)
 * Se for do Google Drive, aplica otimizações
 */
export function getOptimizedImageUrl(url: string, config: ImageSizeConfig): string {
  // Se for URL do Supabase Storage, usar diretamente (já é otimizada)
  if (isSupabaseStorageUrl(url)) {
    return url;
  }
  
  // Se for do Google Drive, aplicar otimizações
  return getOptimizedGoogleDriveUrl(url, config);
}
