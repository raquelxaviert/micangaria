// TESTE COMPLETO - Diagnóstico das Coleções
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://koduoglrfzronbcgqrjc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI'
);

async function testCompleteFlow() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA DE COLEÇÕES');
  console.log('=====================================');

  try {
    // 1. Verificar coleções existentes
    console.log('\n1️⃣ Verificando coleções existentes...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .order('display_order');

    if (collectionsError) {
      console.error('❌ Erro ao buscar coleções:', collectionsError);
      return;
    }

    console.log(`✅ Encontradas ${collections?.length || 0} coleções:`);
    collections?.forEach(col => {
      console.log(`   - ID: ${col.id} | Nome: ${col.name} | Slug: ${col.slug}`);
    });

    // 2. Verificar produtos existentes
    console.log('\n2️⃣ Verificando produtos existentes...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('is_active', true)
      .limit(5);

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      return;
    }

    console.log(`✅ Encontrados ${products?.length || 0} produtos ativos:`);
    products?.forEach(prod => {
      console.log(`   - ID: ${prod.id} | Nome: ${prod.name}`);
    });

    // 3. Teste de inserção simulada com IDs reais
    if (collections && collections.length > 0 && products && products.length > 0) {
      console.log('\n3️⃣ Testando inserção com IDs reais...');
      
      const testCollection = collections[0];
      const testProduct = products[0];
      
      console.log(`📝 Usando coleção: ${testCollection.name} (${testCollection.id})`);
      console.log(`📦 Usando produto: ${testProduct.name} (${testProduct.id})`);

      // Primeiro, limpar possíveis testes anteriores
      await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', testCollection.id)
        .eq('product_id', testProduct.id);

      // Testar inserção
      const { data: insertResult, error: insertError } = await supabase
        .from('collection_products')
        .insert([{
          collection_id: testCollection.id,
          product_id: testProduct.id,
          display_order: 0
        }])
        .select();

      if (insertError) {
        console.error('❌ Erro na inserção de teste:', insertError);
        console.error('🔍 Detalhes:', JSON.stringify(insertError, null, 2));
      } else {
        console.log('✅ Inserção de teste bem-sucedida!');
        console.log('📊 Dados inseridos:', insertResult);

        // Limpar o teste
        await supabase
          .from('collection_products')
          .delete()
          .eq('collection_id', testCollection.id)
          .eq('product_id', testProduct.id);
        console.log('🧹 Teste limpo com sucesso');
      }
    } else {
      console.log('\n⚠️ Não há coleções ou produtos suficientes para teste');
    }

    // 4. Verificar relacionamentos existentes
    console.log('\n4️⃣ Verificando relacionamentos existentes...');
    const { data: relations, error: relationsError } = await supabase
      .from('collection_products')
      .select('*');

    if (relationsError) {
      console.error('❌ Erro ao buscar relacionamentos:', relationsError);
    } else {
      console.log(`📊 Relacionamentos existentes: ${relations?.length || 0}`);
      relations?.forEach(rel => {
        console.log(`   - Coleção: ${rel.collection_id} | Produto: ${rel.product_id}`);
      });
    }

    console.log('\n✅ DIAGNÓSTICO COMPLETO!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testCompleteFlow().catch(console.error);
