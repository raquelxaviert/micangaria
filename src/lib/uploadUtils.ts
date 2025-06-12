// Utility para upload de imagens para Supabase Storage
import { createClient } from '@/lib/supabase/client';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImageToSupabase(file: File): Promise<ImageUploadResult> {
  try {
    console.log('🚀 Iniciando upload para Supabase:', file.name);
    
    // Gerar nome único para arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Conectar ao Supabase
    const supabase = createClient();
    
    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
        if (error) {
      console.error('❌ Erro no upload Supabase:', error);
      const errorMessage = error instanceof Error ? error.message : (error as any)?.message || 'Erro no upload';
      return {
        success: false,
        error: errorMessage
      };
    }
    
    console.log('✅ Upload bem-sucedido:', data);
    
    // Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
      
    console.log('✅ URL pública gerada:', publicUrl);
    
    return {
      success: true,
      url: publicUrl
    };
    
  } catch (error: any) {
    console.error('❌ Erro geral no upload:', error);
    return {
      success: false,
      error: error?.message || 'Erro desconhecido'
    };
  }
}
