// Script de teste para upload no Supabase Storage
// Execute este código no console do navegador (F12) para testar se o bucket está funcionando

async function testarUploadSupabase() {
  try {
    console.log('🧪 Iniciando teste do Supabase Storage...');
    
    // Importar o cliente Supabase (ajuste conforme seu setup)
    const { createClient } = await import('./src/lib/supabase/client.js');
    const supabase = createClient();
    
    // 1. Testar listagem de buckets
    console.log('📋 Testando listagem de buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return false;
    }
    
    console.log('✅ Buckets encontrados:', buckets?.map(b => b.name));
    
    const productImagesBucket = buckets?.find(b => b.name === 'product-images');
    if (!productImagesBucket) {
      console.error('❌ Bucket "product-images" não encontrado!');
      return false;
    }
    
    console.log('✅ Bucket "product-images" encontrado:', productImagesBucket);
    
    // 2. Criar um arquivo de teste
    const testContent = 'teste de upload';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = `test/${testFileName}`;
    
    // 3. Testar upload
    console.log('📤 Testando upload...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFilePath, testFile);
    
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      return false;
    }
    
    console.log('✅ Upload realizado com sucesso:', uploadData);
    
    // 4. Testar URL pública
    console.log('🔗 Testando URL pública...');
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(testFilePath);
    
    console.log('✅ URL pública gerada:', publicUrl);
    
    // 5. Testar download/acesso
    console.log('⬇️ Testando acesso à URL...');
    const response = await fetch(publicUrl);
    if (response.ok) {
      const content = await response.text();
      console.log('✅ Conteúdo baixado:', content);
    } else {
      console.error('❌ Erro ao acessar URL:', response.status, response.statusText);
      return false;
    }
    
    // 6. Limpar arquivo de teste
    console.log('🧹 Limpando arquivo de teste...');
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([testFilePath]);
    
    if (deleteError) {
      console.warn('⚠️ Erro ao deletar arquivo de teste:', deleteError);
    } else {
      console.log('✅ Arquivo de teste removido');
    }
    
    console.log('🎉 Teste completo! O bucket está funcionando corretamente.');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
    return false;
  }
}

// Executar o teste
testarUploadSupabase();
