// Test Supabase connection and bucket setup
import { createClient } from '@supabase/supabase-js';

// Get env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pvivhqxeqixkwgggtseb.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aXZocXhlcWl4a3dnZ2d0c2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNTYzNzIsImV4cCI6MjA0ODkzMjM3Mn0.gXG1MBJRgLp4ykn6_DjJYA6Bh9rNBDi8vT0Vl3Dd9To';

console.log('=== TESTE SUPABASE SIMPLES ===');
console.log('URL:', supabaseUrl);
console.log('Key (primeiros 20 chars):', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBucket() {
  try {
    console.log('\n1. Testando listagem de buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    // Verificar se bucket product-images existe
    const productImagesBucket = buckets.find(b => b.name === 'product-images');
    if (!productImagesBucket) {
      console.log('❌ Bucket "product-images" não encontrado');
      return;
    }
    
    console.log('✅ Bucket "product-images" encontrado!');
    
    // Testar upload de um arquivo simples
    console.log('\n2. Testando upload...');
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const fileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, testFile);
    
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      console.error('Detalhes:', JSON.stringify(uploadError, null, 2));
      return;
    }
    
    console.log('✅ Upload bem-sucedido:', uploadData);
    
    // Testar URL pública
    console.log('\n3. Testando URL pública...');
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    
    console.log('✅ URL pública:', urlData.publicUrl);
    
    // Cleanup - remover arquivo de teste
    console.log('\n4. Limpando arquivo de teste...');
    const { error: removeError } = await supabase.storage
      .from('product-images')
      .remove([fileName]);
    
    if (removeError) {
      console.log('⚠️ Aviso ao remover arquivo:', removeError);
    } else {
      console.log('✅ Arquivo de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testBucket();
