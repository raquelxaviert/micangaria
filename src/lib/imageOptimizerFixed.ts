/**
 * Image Optimizer - Versão Simplificada com API Route
 * 
 * Transfere imagens do Google Drive para Supabase Storage usando API route
 * para evitar problemas de CORS
 */

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface ImageTransferResult {
  success: boolean;
  supabaseUrl?: string;
  error?: string;
}

/**
 * Transfere uma imagem do Google Drive para o Supabase Storage via API route
 */
export async function transferImageFromGoogleDrive(
  googleDriveUrl: string,
  productId: string,
  fileName?: string
): Promise<ImageTransferResult> {
  try {
    console.log('🔄 Transferindo imagem via API route:', googleDriveUrl);
      // Chamar a API route para fazer o processamento no servidor
    const response = await fetch('/api/optimize-image-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleDriveUrl,
        productId,
        fileName
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('❌ Erro na API de otimização:', result.error);
      return { 
        success: false, 
        error: result.error || 'Erro desconhecido na otimização' 
      };
    }

    console.log('✅ Imagem transferida com sucesso:', result.supabaseUrl);
    
    return {
      success: true,
      supabaseUrl: result.supabaseUrl
    };
    
  } catch (error) {
    console.error('❌ Erro na transferência de imagem:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro de comunicação com a API' 
    };
  }
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
    
    // Pequena pausa entre uploads para não sobrecarregar
    if (i < googleDriveUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
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
      .from('product-imgs')
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
