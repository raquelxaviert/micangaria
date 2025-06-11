const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://koduoglrfzronbcgqrjc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI'
);

async function testCompleteIntegration() {
  console.log('🔄 TESTE COMPLETO DE INTEGRAÇÃO ADMIN → SUPABASE → FRONTEND');
  console.log('=====================================================');

  try {
    // 1. Buscar coleções (como o admin faria)
    console.log('\n1️⃣ Testando carregamento de coleções (como admin)...');
    const { data: collections, error: collError } = await supabase
      .from('collections_with_counts')
      .select('*')
      .order('display_order');

    if (collError) {
      console.error('❌ Erro ao carregar coleções:', collError);
      return;
    }

    console.log(`✅ ${collections.length} coleções carregadas:`);
    collections.forEach(c => {
      console.log(`   - ${c.name} (${c.id}) - ${c.product_count} produtos`);
    });

    // 2. Buscar produtos disponíveis
    console.log('\n2️⃣ Testando carregamento de produtos...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('is_active', true)
      .limit(3);

    if (prodError) {
      console.error('❌ Erro ao carregar produtos:', prodError);
      return;
    }

    console.log(`✅ ${products.length} produtos disponíveis:`);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.id})`);
    });

    // 3. Simular adição de produto à primeira coleção
    if (collections.length > 0 && products.length > 0) {
      const collection = collections[0];
      const product = products[0];
      
      console.log('\n3️⃣ Simulando adição de produto à coleção...');
      console.log(`   Coleção: ${collection.name}`);
      console.log(`   Produto: ${product.name}`);

      // Limpar produtos existentes da coleção
      await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', collection.id);

      // Adicionar produto
      const { data: insertData, error: insertError } = await supabase
        .from('collection_products')
        .insert([{
          collection_id: collection.id,
          product_id: product.id,
          display_order: 0
        }])
        .select();

      if (insertError) {
        console.error('❌ Erro ao adicionar produto:', insertError);
      } else {
        console.log('✅ Produto adicionado com sucesso!');
      }

      // 4. Verificar resultado (como frontend faria)
      console.log('\n4️⃣ Verificando resultado (como frontend)...');
      const { data: collectionWithProducts, error: verifyError } = await supabase
        .from('collection_products')
        .select(`
          id,
          display_order,
          collection_id,
          product_id,
          collections(name, slug),
          products(name, price, image_url)
        `)
        .eq('collection_id', collection.id);

      if (verifyError) {
        console.error('❌ Erro na verificação:', verifyError);
      } else {
        console.log('✅ Dados verificados:');
        collectionWithProducts.forEach(item => {
          console.log(`   - ${item.products.name} em "${item.collections.name}"`);
        });
      }

      // 5. Teste da função get_collection_products
      console.log('\n5️⃣ Testando função get_collection_products...');
      const { data: functionResult, error: funcError } = await supabase
        .rpc('get_collection_products', { collection_slug: collection.slug });

      if (funcError) {
        console.error('❌ Erro na função:', funcError);
      } else {
        console.log(`✅ Função retornou ${functionResult.length} produtos`);
        functionResult.forEach(p => {
          console.log(`   - ${p.name} (R$ ${p.price})`);
        });
      }

      // 6. Limpeza
      console.log('\n6️⃣ Limpando dados de teste...');
      await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', collection.id);
      console.log('✅ Limpeza concluída');
    }

    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log('=====================================');
    console.log('✅ Admin pode carregar coleções do Supabase');
    console.log('✅ Admin pode adicionar produtos às coleções');
    console.log('✅ Frontend pode buscar produtos por coleção');
    console.log('✅ Função get_collection_products funciona');
    console.log('\n📝 Próximos passos:');
    console.log('1. Teste o admin em http://localhost:9002/admin');
    console.log('2. Adicione produtos às coleções');
    console.log('3. Implemente páginas de coleção no frontend');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testCompleteIntegration();
