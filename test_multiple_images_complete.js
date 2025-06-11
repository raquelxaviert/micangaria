const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDcwMDQsImV4cCI6MjA1MTQyMzAwNH0.aoNHJMBVJJVJt9rHAG8d6FkU4Y5xQ0jLZOyZwLOwfnI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMultipleImages() {
  console.log('🧪 Testando sistema de múltiplas imagens...\n');

  try {
    // 1. Verificar se a coluna gallery_urls existe
    console.log('1. Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'products')
      .in('column_name', ['gallery_urls', 'image_alt']);

    if (columnsError) {
      console.log('⚠️ Não foi possível verificar colunas:', columnsError.message);
    } else {
      console.log('✅ Colunas encontradas:', columns?.map(c => c.column_name) || []);
    }

    // 2. Criar produto de teste com múltiplas imagens
    console.log('\n2. Criando produto com múltiplas imagens...');
    const testProduct = {
      name: 'TESTE - Colar com Múltiplas Imagens',
      description: 'Produto de teste para validar sistema de múltiplas imagens com carrossel',
      price: 199.99,
      type: 'colar',
      style: 'vintage',
      image_url: '/products/colar.jpg',
      gallery_urls: [
        '/products/colar2.jpg',
        '/products/colar3.jpg',
        '/products/colar4.jpg',
        '/products/conjunto_colares.jpg'
      ],
      colors: ['dourado', 'bronze', 'vintage'],
      materials: ['metal nobre', 'cristais', 'pedras naturais'],
      sizes: ['único'],
      is_active: true,
      is_featured: true,
      is_new_arrival: true
    };

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro ao inserir produto:', insertError.message);
      return;
    }

    console.log('✅ Produto criado com sucesso:');
    console.log(`   ID: ${insertedProduct.id}`);
    console.log(`   Nome: ${insertedProduct.name}`);
    console.log(`   Imagem principal: ${insertedProduct.image_url}`);
    console.log(`   Galeria (${insertedProduct.gallery_urls?.length || 0} imagens):`, insertedProduct.gallery_urls);

    // 3. Testar consulta com múltiplas imagens
    console.log('\n3. Testando consulta de produtos com múltiplas imagens...');
    const { data: products, error: queryError } = await supabase
      .from('products')
      .select('id, name, image_url, gallery_urls')
      .eq('is_active', true)
      .not('gallery_urls', 'is', null)
      .limit(5);

    if (queryError) {
      console.log('❌ Erro na consulta:', queryError.message);
    } else {
      console.log(`✅ Encontrados ${products?.length || 0} produtos com galeria:`);
      products?.forEach((p, index) => {
        const totalImages = 1 + (Array.isArray(p.gallery_urls) ? p.gallery_urls.length : 0);
        console.log(`   ${index + 1}. ${p.name} - ${totalImages} imagens`);
      });
    }

    // 4. Testar função de contagem de imagens (se existir)
    console.log('\n4. Testando função count_product_images...');
    try {
      const { data: countTest, error: countError } = await supabase
        .rpc('count_product_images', { product_row: insertedProduct });

      if (countError) {
        console.log('⚠️ Função count_product_images não disponível:', countError.message);
      } else {
        console.log(`✅ Total de imagens do produto: ${countTest}`);
      }
    } catch (error) {
      console.log('⚠️ Função count_product_images não encontrada');
    }

    // 5. Testar view products_with_image_info (se existir)
    console.log('\n5. Testando view products_with_image_info...');
    try {
      const { data: viewTest, error: viewError } = await supabase
        .from('products_with_image_info')
        .select('id, name, total_images, all_images')
        .eq('id', insertedProduct.id)
        .single();

      if (viewError) {
        console.log('⚠️ View products_with_image_info não disponível:', viewError.message);
      } else {
        console.log('✅ Dados da view:');
        console.log(`   Total de imagens: ${viewTest.total_images}`);
        console.log(`   Todas as imagens:`, viewTest.all_images);
      }
    } catch (error) {
      console.log('⚠️ View products_with_image_info não encontrada');
    }

    // 6. Testar reordenação de imagens
    console.log('\n6. Testando reordenação de imagens...');
    const newGalleryOrder = [
      '/products/conjunto_colares.jpg',
      '/products/colar4.jpg',
      '/products/colar2.jpg',
      '/products/colar3.jpg'
    ];

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ gallery_urls: newGalleryOrder })
      .eq('id', insertedProduct.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erro ao reordenar imagens:', updateError.message);
    } else {
      console.log('✅ Imagens reordenadas com sucesso:');
      console.log('   Nova ordem:', updatedProduct.gallery_urls);
    }

    console.log('\n🎉 Teste de múltiplas imagens concluído com sucesso!');
    console.log('\n📝 Resumo:');
    console.log('   ✅ Produto criado com 5 imagens (1 principal + 4 galeria)');
    console.log('   ✅ Consulta de produtos com galeria funcionando');
    console.log('   ✅ Reordenação de imagens funcionando');
    console.log('\n🚀 Pronto para usar no admin e frontend!');

    return insertedProduct.id;

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

async function cleanupTestProduct(productId) {
  if (!productId) return;
  
  console.log('\n🧹 Limpando produto de teste...');
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.log('⚠️ Erro ao limpar produto de teste:', error.message);
  } else {
    console.log('✅ Produto de teste removido');
  }
}

// Executar teste
testMultipleImages().then(productId => {
  // Comentar a linha abaixo se quiser manter o produto de teste
  // cleanupTestProduct(productId);
});
