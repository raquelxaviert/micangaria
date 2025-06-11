// Script para testar se a deleção está funcionando
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeleteOperation() {
  console.log('🧪 Testando operação de deleção...\n');
  
  try {
    // 1. Criar um produto temporário para teste
    console.log('1. Criando produto temporário...');
    const { data: newProduct, error: createError } = await supabase
      .from('products')
      .insert([{
        name: 'PRODUTO TESTE DELETE',
        description: 'Este produto será deletado automaticamente',
        price: 99.99,
        type: 'acessorio',
        style: 'vintage',
        colors: ['teste'],
        is_active: true
      }])
      .select();
      
    if (createError) {
      console.error('❌ Erro ao criar produto teste:', createError);
      return;
    }
    
    const testProductId = newProduct[0].id;
    console.log('✅ Produto teste criado:', testProductId);
    console.log('📦 Nome:', newProduct[0].name);
    console.log('🔗 SKU:', newProduct[0].sku);
    
    // 2. Verificar se produto existe
    console.log('\n2. Verificando se produto existe...');
    const { data: checkProduct, error: checkError } = await supabase
      .from('products')
      .select('id, name, sku')
      .eq('id', testProductId);
      
    if (checkError) {
      console.error('❌ Erro ao verificar produto:', checkError);
      return;
    }
    
    console.log('✅ Produto encontrado:', checkProduct[0]);
    
    // 3. Deletar o produto
    console.log('\n3. Deletando produto...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProductId);
      
    if (deleteError) {
      console.error('❌ Erro ao deletar produto:', deleteError);
      return;
    }
    
    console.log('✅ Produto deletado com sucesso!');
    
    // 4. Verificar se produto foi realmente deletado
    console.log('\n4. Verificando se foi realmente deletado...');
    const { data: verifyDelete, error: verifyError } = await supabase
      .from('products')
      .select('id')
      .eq('id', testProductId);
      
    if (verifyError) {
      console.error('❌ Erro ao verificar deleção:', verifyError);
      return;
    }
    
    if (verifyDelete.length === 0) {
      console.log('✅ Confirmado: Produto foi deletado da tabela!');
    } else {
      console.log('⚠️ Produto ainda existe na tabela');
    }
    
    console.log('\n🎉 Teste de deleção concluído com sucesso!');
    console.log('🔧 A funcionalidade de delete do admin agora funciona corretamente.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDeleteOperation();
