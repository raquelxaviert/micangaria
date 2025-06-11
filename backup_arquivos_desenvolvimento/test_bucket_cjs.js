const { createClient } = require('@supabase/supabase-js');

// Get env vars
const supabaseUrl = 'https://pvivhqxeqixkwgggtseb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aXZocXhlcWl4a3dnZ2d0c2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNTYzNzIsImV4cCI6MjA0ODkzMjM3Mn0.gXG1MBJRgLp4ykn6_DjJYA6Bh9rNBDi8vT0Vl3Dd9To';

console.log('=== TESTE SUPABASE BUCKET ===');
console.log('URL:', supabaseUrl);
console.log('Key (primeiros 20 chars):', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBucket() {
  try {
    console.log('\n1. Testando listagem de buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', JSON.stringify(listError, null, 2));
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets ? buckets.map(b => b.name) : 'Nenhum');
    
    // Verificar se bucket product-images existe
    const productImagesBucket = buckets && buckets.find(b => b.name === 'product-images');
    if (!productImagesBucket) {
      console.log('❌ Bucket "product-images" não encontrado');
      
      // Tentar criar o bucket
      console.log('\n2. Tentando criar bucket...');
      const { data: createData, error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', JSON.stringify(createError, null, 2));
        return;
      }
      
      console.log('✅ Bucket criado:', createData);
    } else {
      console.log('✅ Bucket "product-images" encontrado!');
    }
    
    // Testar upload de um arquivo simples
    console.log('\n3. Testando upload...');
    const testContent = Buffer.from('test content', 'utf8');
    const fileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, testContent, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.error('❌ Erro no upload:', JSON.stringify(uploadError, null, 2));
      
      // Verificar se é problema de RLS
      if (uploadError.message && uploadError.message.includes('row-level security')) {
        console.log('\n⚠️ PROBLEMA DE RLS DETECTADO!');
        console.log('Execute o SQL de configuração no Supabase Dashboard:');
        console.log('supabase_setup_parte1_storage.sql');
      }
      
      return;
    }
    
    console.log('✅ Upload bem-sucedido:', uploadData);
    
    // Testar URL pública
    console.log('\n4. Testando URL pública...');
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    
    console.log('✅ URL pública:', urlData.publicUrl);
    
    // Cleanup - remover arquivo de teste
    console.log('\n5. Limpando arquivo de teste...');
    const { error: removeError } = await supabase.storage
      .from('product-images')
      .remove([fileName]);
    
    if (removeError) {
      console.log('⚠️ Aviso ao remover arquivo:', JSON.stringify(removeError, null, 2));
    } else {
      console.log('✅ Arquivo de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message || error);
    console.error('Stack:', error.stack);
  }
}

testBucket().then(() => {
  console.log('\n=== FIM DO TESTE ===');
}).catch(err => {
  console.error('❌ Erro fatal:', err);
});
