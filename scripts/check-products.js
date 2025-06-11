// Script para verificar produtos reais no Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('🚀 Iniciando verificação...');
  
  try {
    console.log('🔍 Buscando todos os produtos...');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .order('created_at');
    
    console.log('📊 Resposta recebida:', { data: !!products, error: !!error });
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️ Nenhum produto encontrado na tabela');
      return;
    }

    console.log('✅ Produtos encontrados:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.id} | Nome: ${product.name}`);
    });

    console.log('\n📋 IDs válidos para uso:');
    console.log(JSON.stringify(products.map(p => p.id), null, 2));

  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.error('❌ Stack:', error.stack);
  }
}

checkProducts();
