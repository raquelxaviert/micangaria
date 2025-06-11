const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://koduoglrfzronbcgqrjc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI'
);

async function populateCollections() {
  console.log('🔄 POPULANDO COLEÇÕES COM PRODUTOS REAIS');
  console.log('=====================================');

  try {
    // 1. Buscar todas as coleções
    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('id, name, slug')
      .order('display_order');

    if (collError) {
      console.error('❌ Erro ao buscar coleções:', collError);
      return;
    }

    // 2. Buscar todos os produtos
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, type')
      .eq('is_active', true);

    if (prodError) {
      console.error('❌ Erro ao buscar produtos:', prodError);
      return;
    }

    console.log(`✅ ${collections.length} coleções encontradas`);
    console.log(`✅ ${products.length} produtos encontrados`);

    // 3. Limpar todas as coleções existentes
    console.log('\n🧹 Limpando coleções existentes...');
    await supabase.from('collection_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 4. Distribuir produtos nas coleções
    const collectionsMap = {
      'promocoes-especiais': products.slice(0, 2), // Primeiros 2 produtos
      'novidades': products.slice(1, 4), // Produtos 2-4
      'pecas-selecionadas': products.slice(0, 3), // Primeiros 3 produtos
      'colecao-vintage': products.slice(2, 5) // Produtos 3-5
    };

    for (const collection of collections) {
      const collectionProducts = collectionsMap[collection.slug] || [];
      
      if (collectionProducts.length > 0) {
        console.log(`\n📦 Adicionando ${collectionProducts.length} produtos à coleção "${collection.name}"`);
        
        const insertData = collectionProducts.map((product, index) => ({
          collection_id: collection.id,
          product_id: product.id,
          display_order: index
        }));

        const { error: insertError } = await supabase
          .from('collection_products')
          .insert(insertData);

        if (insertError) {
          console.error(`❌ Erro ao adicionar produtos à coleção ${collection.name}:`, insertError);
        } else {
          console.log(`✅ ${collectionProducts.length} produtos adicionados à "${collection.name}"`);
          collectionProducts.forEach(p => {
            console.log(`   - ${p.name}`);
          });
        }
      }
    }

    // 5. Verificar resultado
    console.log('\n🔍 VERIFICANDO RESULTADO...');
    for (const collection of collections) {
      const { data: collectionProducts, error } = await supabase
        .from('collection_products')
        .select(`
          id,
          collections(name),
          products(name)
        `)
        .eq('collection_id', collection.id);

      if (!error && collectionProducts) {
        console.log(`\n✅ ${collection.name}: ${collectionProducts.length} produtos`);
        collectionProducts.forEach(cp => {
          console.log(`   - ${cp.products.name}`);
        });
      }
    }

    console.log('\n🎉 POPULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('===================================');
    console.log('✅ Todas as coleções foram populadas com produtos reais');
    console.log('✅ Agora a página full-store deve exibir produtos');
    console.log('\n📱 Acesse: http://localhost:9002/full-store');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

populateCollections();
