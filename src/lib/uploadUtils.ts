// Utility para upload de imagens para Supabase Storage
import { createClient } from '@/lib/supabase/client';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export const uploadImageToSupabase = async (file: File): Promise<ImageUploadResult> => {
  try {
    console.log('🚀 Iniciando upload para Supabase:', file.name);
    console.log('📊 Tamanho do arquivo:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const supabase = createClient();

    // Verificar se o cliente Supabase foi criado corretamente
    if (!supabase) {
      throw new Error('Não foi possível criar cliente Supabase');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;
    
    console.log('📂 Caminho do arquivo:', filePath);
    console.log('🏪 Bucket de destino: product-images');
      // Verificar se o bucket existe
    console.log('🔍 Verificando existência do bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return {
        success: false,
        error: `Erro ao verificar buckets: ${bucketsError.message}`
      };
    } else {      console.log('🪣 Buckets disponíveis:', buckets?.map(b => b.name));
      const productImagesBucket = buckets?.find(b => b.name === 'product-imgs');
      if (!productImagesBucket) {
        console.error('❌ Bucket "product-imgs" não encontrado!');
        return {
          success: false,
          error: 'Bucket "product-imgs" não encontrado. Execute o script criar-bucket-alternativo.sql'
        };
      }
      console.log('✅ Bucket encontrado:', productImagesBucket);
    }
      // Teste adicional: tentar listar conteúdo do bucket
    console.log('🔍 Testando acesso ao bucket...');
    const { data: bucketTest, error: bucketTestError } = await supabase.storage
      .from('product-imgs')
      .list('', { limit: 1 });
    
    if (bucketTestError) {
      console.error('❌ Erro ao acessar bucket:', bucketTestError);
      if (bucketTestError.message.includes('bucketId is required')) {
        return {
          success: false,
          error: 'Erro de configuração do bucket. O bucket existe mas não está acessível. Tente recriar o bucket ou aguarde alguns minutos.'
        };
      }
      return {
        success: false,
        error: `Erro ao acessar bucket: ${bucketTestError.message}`
      };
    }
    console.log('✅ Bucket acessível:', bucketTest !== null);
      // Upload para Supabase Storage
    console.log('📤 Fazendo upload...');
    const { data, error } = await supabase.storage
      .from('product-imgs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
        if (error) {
      console.error('❌ Erro no upload Supabase:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        statusCode: (error as any)?.statusCode,
        name: error.name
      });
      
      let errorMessage = error.message;
      
      // Tratar erros específicos
      if (error.message.includes('row-level security policy')) {
        errorMessage = 'Erro de permissão no Storage. Verifique as políticas RLS do bucket "product-images".';
      } else if (error.message.includes('bucketId is required')) {
        errorMessage = 'Bucket ID necessário. Verifique se o bucket "product-images" existe.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    console.log('✅ Upload bem-sucedido:', data);
      // Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-imgs')
      .getPublicUrl(filePath);
      
    console.log('✅ URL pública gerada:', publicUrl);
    
    return {
      success: true,
      url: publicUrl,
      path: filePath
    };
    
  } catch (error: any) {
    console.error('❌ Erro geral no upload:', error);
    return {
      success: false,
      error: error?.message || 'Erro desconhecido'
    };
  }
}

export const deleteImageFromSupabase = async (filePath: string) => {  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from('product-imgs')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar imagem do Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Erro inesperado na deleção:', error);
    return { success: false, error: error.message };
  }
}
