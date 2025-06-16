/**
 * Testa conectividade e configuração das imagens
 */

export async function testImageConnectivity(imageUrl: string): Promise<{
  success: boolean;
  status?: number;
  error?: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testando conectividade da imagem:', imageUrl);
    
    const response = await fetch(imageUrl, {
      method: 'HEAD', // Apenas cabeçalhos, não baixa a imagem
      cache: 'no-cache'
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      console.log(`✅ Imagem OK em ${responseTime}ms:`, imageUrl);
      return { 
        success: true, 
        status: response.status,
        responseTime 
      };
    } else {
      console.error(`❌ Erro ${response.status} para imagem:`, imageUrl);
      return { 
        success: false, 
        status: response.status,
        error: `HTTP ${response.status}`,
        responseTime 
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Erro de conectividade:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      responseTime 
    };
  }
}

/**
 * Testa múltiplas imagens
 */
export async function testMultipleImages(imageUrls: string[]): Promise<void> {
  console.log(`🔍 Testando ${imageUrls.length} imagens...`);
  
  for (const url of imageUrls.slice(0, 3)) { // Testa apenas as 3 primeiras
    await testImageConnectivity(url);
  }
}

/**
 * Verifica se o Supabase Storage está configurado corretamente
 */
export async function testSupabaseStorageConnection(): Promise<boolean> {
  const testUrl = 'https://koduoglrfzronbcgqrjc.supabase.co/storage/v1/object/public/product-imgs/test';
  
  try {
    const response = await fetch(testUrl, { method: 'HEAD' });
    // Se retornar 404, significa que o bucket existe (mas o arquivo test não)
    // Se retornar 403, pode ter problema de política
    // Se retornar erro de rede, tem problema de conectividade
    
    if (response.status === 404) {
      console.log('✅ Supabase Storage bucket acessível');
      return true;
    } else if (response.status === 403) {
      console.warn('⚠️ Supabase Storage pode ter problema de política RLS');
      return false;
    } else {
      console.log(`🔍 Supabase Storage status: ${response.status}`);
      return response.ok;
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase Storage:', error);
    return false;
  }
}
