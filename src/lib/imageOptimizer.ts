/**
 * Image Optimizer - Transfere imagens do Google Drive para Supabase Storage
 * 
 * Este módulo otimiza o carregamento de imagens transferindo-as do Google Drive
 * para o Supabase Storage, que é muito mais rápido para servir imagens.
 */

import { createClient } from '@/lib/supabase/client';
import { STORAGE_CONFIG, validateFileUpload, generateStorageFileName } from '@/lib/storageConfig';

const supabase = createClient();

interface ImageTransferResult {
  success: boolean;
  supabaseUrl?: string;
  error?: string;
}

/**
 * Extrai o ID do arquivo do Google Drive de uma URL
 */
function extractGoogleDriveId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Gera um nome único para o arquivo no Supabase
 */
function generateUniqueFileName(originalName: string, productId: string): string {
  return generateStorageFileName(originalName, `${STORAGE_CONFIG.FOLDER_STRUCTURE.PRODUCTS}/${productId}`);
}

/**
 * Verifica se a URL é do Google Drive
 */
function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Verifica se a URL já é do Supabase Storage (já otimizada)
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/');
}

/**
 * Baixa uma imagem do Google Drive e faz upload para o Supabase Storage
 */
export async function transferImageFromGoogleDrive(
  googleDriveUrl: string,
  productId: string,
  fileName?: string
): Promise<ImageTransferResult> {
  try {
    console.log('🔄 Transferindo imagem do Google Drive para Supabase:', googleDriveUrl);
    
    // Verificar se já é URL do Supabase (já otimizada)
    if (isSupabaseStorageUrl(googleDriveUrl)) {
      console.log('✅ Imagem já está no Supabase, pulando:', googleDriveUrl);
      return { success: true, supabaseUrl: googleDriveUrl };
    }
    
    // Verificar se é URL do Google Drive
    if (!isGoogleDriveUrl(googleDriveUrl)) {
      console.log('⚠️ URL não é do Google Drive:', googleDriveUrl);
      return { success: false, error: 'URL não é do Google Drive' };
    }
    
    // Extrair ID do Google Drive
    const driveId = extractGoogleDriveId(googleDriveUrl);
    if (!driveId) {
      return { success: false, error: 'URL do Google Drive inválida' };
    }
    
    // URL direta para download do Google Drive
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
    
    // Baixar a imagem
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return { success: false, error: 'Erro ao baixar imagem do Google Drive' };
    }
      const blob = await response.blob();
    const file = new File([blob], fileName || `image-${driveId}.jpg`, { type: blob.type });
    
    // Validar arquivo antes do upload
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      return { success: false, error: validation.error || 'Arquivo inválido' };
    }
    
    // Gerar nome único para o Supabase
    const supabaseFileName = generateUniqueFileName(file.name, productId);
      // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.PRODUCT_IMAGES_BUCKET)
      .upload(supabaseFileName, file, {
        cacheControl: STORAGE_CONFIG.CACHE_CONTROL.IMAGES,
        upsert: false
      });
    
    if (error) {
      console.error('❌ Erro no upload para Supabase:', error);
      return { success: false, error: error.message };
    }
      // Gerar URL pública do Supabase
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(supabaseFileName);
    
    console.log('✅ Imagem transferida com sucesso:', urlData.publicUrl);
    
    return {
      success: true,
      supabaseUrl: urlData.publicUrl
    };
    
  } catch (error) {
    console.error('❌ Erro na transferência de imagem:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Transfere múltiplas imagens do Google Drive para o Supabase Storage
 */
export async function transferMultipleImages(
  googleDriveUrls: string[],
  productId: string
): Promise<{
  success: boolean;
  supabaseUrls: string[];
  errors: string[];
}> {
  console.log(`🔄 Processando ${googleDriveUrls.length} imagens...`);
  
  const supabaseUrls: string[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < googleDriveUrls.length; i++) {
    const url = googleDriveUrls[i];
    
    // Verificar se a URL já foi otimizada (Supabase) ou precisa ser transferida (Google Drive)
    if (isSupabaseStorageUrl(url)) {
      console.log(`✅ Imagem já otimizada (Supabase): ${url}`);
      supabaseUrls.push(url);
      continue;
    }
    
    if (!isGoogleDriveUrl(url)) {
      console.log(`⚠️ URL não é do Google Drive, mantendo como está: ${url}`);
      supabaseUrls.push(url);
      continue;
    }
    
    // Transferir apenas URLs do Google Drive
    const result = await transferImageFromGoogleDrive(url, productId, `image-${i + 1}`);
    
    if (result.success && result.supabaseUrl) {
      supabaseUrls.push(result.supabaseUrl);
    } else {
      errors.push(result.error || 'Erro desconhecido');
    }
  }
  
  return {
    success: supabaseUrls.length > 0,
    supabaseUrls,
    errors
  };
}

/**
 * Atualiza um produto no Supabase com as URLs otimizadas
 */
export async function updateProductWithOptimizedImages(
  productId: string,
  mainImageUrl: string,
  galleryUrls: string[] = []
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        image_url: mainImageUrl,
        gallery_urls: galleryUrls,
        images_optimized: true, // Flag para indicar que as imagens foram otimizadas
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Produto atualizado com imagens otimizadas');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Processo completo: transfere todas as imagens de um produto e atualiza no banco
 */
export async function optimizeProductImages(productId: string): Promise<{
  success: boolean;
  message: string;
  optimizedUrls?: {
    mainImage: string;
    gallery: string[];
  };
}> {
  try {
    console.log(`🚀 Iniciando otimização de imagens para produto ${productId}`);
    
    // Buscar produto atual
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_url, gallery_urls, images_optimized')
      .eq('id', productId)
      .single();
    
    if (fetchError || !product) {
      return { success: false, message: 'Produto não encontrado' };
    }
      // Verificar se já foi otimizado (mas permitir re-otimização para produtos com imagens mistas)
    const hasGoogleDriveImages = [
      product.image_url,
      ...(product.gallery_urls || [])
    ].some(url => url && isGoogleDriveUrl(url));
    
    if (product.images_optimized && !hasGoogleDriveImages) {
      return { 
        success: true, 
        message: 'Produto já possui todas as imagens otimizadas',
        optimizedUrls: {
          mainImage: product.image_url,
          gallery: product.gallery_urls || []
        }
      };
    }
    
    const allUrls: string[] = [];
    
    // Adicionar imagem principal se existir
    if (product.image_url) {
      allUrls.push(product.image_url);
    }
    
    // Adicionar galeria se existir
    if (product.gallery_urls && Array.isArray(product.gallery_urls)) {
      allUrls.push(...product.gallery_urls);
    }
    
    if (allUrls.length === 0) {
      return { success: false, message: 'Produto não possui imagens para otimizar' };
    }
    
    // Transferir todas as imagens
    const result = await transferMultipleImages(allUrls, productId);
    
    if (!result.success || result.supabaseUrls.length === 0) {
      return { 
        success: false, 
        message: `Erro na transferência: ${result.errors.join(', ')}` 
      };
    }
    
    // Separar imagem principal da galeria
    const [mainImageUrl, ...galleryUrls] = result.supabaseUrls;
    
    // Atualizar produto no banco
    const updateResult = await updateProductWithOptimizedImages(
      productId, 
      mainImageUrl, 
      galleryUrls
    );
    
    if (!updateResult.success) {
      return { 
        success: false, 
        message: `Erro ao atualizar produto: ${updateResult.error}` 
      };
    }
    
    return {
      success: true,
      message: `${result.supabaseUrls.length} imagens otimizadas com sucesso!`,
      optimizedUrls: {
        mainImage: mainImageUrl,
        gallery: galleryUrls
      }
    };
    
  } catch (error) {
    console.error('❌ Erro na otimização:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Remove uma imagem do Supabase Storage
 */
export async function deleteImageFromSupabase(imageUrl: string): Promise<boolean> {
  try {
    // Extrair o caminho do arquivo da URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const folderPath = pathParts.slice(-3, -1).join('/'); // Ex: products/123
    const fullPath = `${folderPath}/${fileName}`;
      const { error } = await supabase.storage
      .from(STORAGE_CONFIG.PRODUCT_IMAGES_BUCKET)
      .remove([fullPath]);
    
    if (error) {
      console.error('❌ Erro ao deletar imagem:', error);
      return false;
    }
    
    console.log('✅ Imagem deletada do Supabase:', fullPath);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao deletar imagem:', error);
    return false;
  }
}
