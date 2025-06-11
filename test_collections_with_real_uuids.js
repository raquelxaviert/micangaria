// Teste para verificar inserção de produtos em coleções com UUIDs reais
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://koduoglrfzronbcgqrjc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI'
);

async function testWithRealUUIDs() {
  console.log('🧪 Testando inserção com UUIDs reais...');
  
  try {
    // 1. Buscar coleções reais
    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('id, name, slug')
      .order('display_order');
      
    if (collError) {
      console.error('❌ Erro ao buscar coleções:', collError);
      return;
    }
    
    console.log('✅ Coleções encontradas:');
    collections.forEach(c => {
      console.log(`  - ${c.name}: ${c.id}`);
    });
    
    // 2. Buscar produtos reais
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name')
      .limit(3);
      
    if (prodError) {
      console.error('❌ Erro ao buscar produtos:', prodError);
      return;
    }
    
    console.log('\n✅ Produtos encontrados:');
    products.forEach(p => {
      console.log(`  - ${p.name}: ${p.id}`);
    });
    
    if (collections.length === 0 || products.length === 0) {
      console.log('⚠️ Não há coleções ou produtos suficientes para teste');
      return;
    }
    
    // 3. Testar inserção real
    const testCollection = collections[0];
    const testProduct = products[0];
    
    console.log(`\n🧪 Testando inserção: ${testProduct.name} → ${testCollection.name}`);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('collection_products')
      .insert([{
        collection_id: testCollection.id,
        product_id: testProduct.id,
        display_order: 0
      }])
      .select();
      
    if (insertError) {
      console.error('❌ Erro na inserção:', insertError);
      console.error('Detalhes:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Inserção bem-sucedida!');
      console.log('Dados inseridos:', insertResult);
      
      // 4. Verificar se foi inserido
      const { data: verification } = await supabase
        .from('collection_products')
        .select('*')
        .eq('collection_id', testCollection.id)
        .eq('product_id', testProduct.id);
        
      console.log('✅ Verificação:', verification);
      
      // 5. Limpar teste
      await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', testCollection.id)
        .eq('product_id', testProduct.id);
        
      console.log('🧹 Teste limpo');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testWithRealUUIDs();
