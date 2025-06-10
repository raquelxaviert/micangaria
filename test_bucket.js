// TESTE DE BUCKET SUPABASE
// Execute no console do navegador (F12) em http://localhost:9002/admin

async function testSupabaseBucket() {
  console.log('=== TESTE DE BUCKET SUPABASE ===');
  
  try {
    // Importar cliente Supabase
    const { createClient } = await import('/src/lib/supabase/client.js');
    const supabase = createClient();
    
    console.log('✓ Cliente Supabase criado');
    
    // 1. Listar buckets
    console.log('\n1. Testando listagem de buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
    } else {
      console.log('✓ Buckets encontrados:', buckets?.map(b => b.name));
      
      // Verificar se product-images existe
      const productImagesBucket = buckets?.find(b => b.name === 'product-images');
      if (productImagesBucket) {
        console.log('✓ Bucket product-images encontrado:', productImagesBucket);
      } else {
        console.log('❌ Bucket product-images NÃO encontrado');
      }
    }
    
    // 2. Testar upload de arquivo teste
    console.log('\n2. Testando upload de arquivo pequeno...');
    
    // Criar arquivo teste
    const testFile = new Blob(['teste'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      console.error('❌ Erro no upload teste:', uploadError);
    } else {
      console.log('✓ Upload teste bem-sucedido:', uploadData);
      
      // 3. Testar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(testFileName);
      
      console.log('✓ URL pública gerada:', publicUrl);
      
      // 4. Limpar arquivo teste
      const { error: deleteError } = await supabase.storage
        .from('product-images')
        .remove([testFileName]);
        
      if (deleteError) {
        console.error('⚠️ Erro ao deletar arquivo teste:', deleteError);
      } else {
        console.log('✓ Arquivo teste removido');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
  
  console.log('\n=== FIM DO TESTE ===');
}

// Executar teste
testSupabaseBucket();
