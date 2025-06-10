// Teste rápido de conexão Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Teste 1: Buscar categorias
    console.log('🔍 Testando busca de categorias...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('❌ Erro ao buscar categorias:', catError);
    } else {
      console.log('✅ Categorias encontradas:', categories?.length || 0);
    }

    // Teste 2: Buscar produtos
    console.log('🔍 Testando busca de produtos...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (prodError) {
      console.error('❌ Erro ao buscar produtos:', prodError);
    } else {
      console.log('✅ Produtos encontrados:', products?.length || 0);
    }

    // Teste 3: Buscar favoritos
    console.log('🔍 Testando busca de favoritos...');
    const { data: favorites, error: favError } = await supabase
      .from('user_favorites')
      .select('*')
      .limit(5);
    
    if (favError) {
      console.error('❌ Erro ao buscar favoritos:', favError);
    } else {
      console.log('✅ Tabela de favoritos existe, registros:', favorites?.length || 0);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
