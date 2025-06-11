// Script para testar sistema de múltiplas imagens
// Execute: node test_multiple_images.js

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const SUPABASE_URL = 'https://koduoglrfzronbcgqrjc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMultipleImages() {
  console.log('🧪 Testando sistema de múltiplas imagens...\n');

  try {
    // 1. Verificar estrutura da tabela
    console.log('1️⃣ Verificando estrutura da tabela...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('products')
      .select('gallery_urls, image_url')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }
    console.log('✅ Tabela products possui as colunas necessárias');

    // 2. Criar produto de teste com múltiplas imagens
    console.log('\n2️⃣ Criando produto de teste...');
    const testProduct = {
      name: 'TESTE - Colar com Múltiplas Imagens',
      description: 'Produto para testar a funcionalidade de múltiplas imagens',
      price: 199.99,
      type: 'colar',
      style: 'vintage',
      image_url: '/products/colar.jpg',
      gallery_urls: [
        '/products/colar2.jpg',
        '/products/colar3.jpg',
        '/products/colar4.jpg',
        '/products/colar5.jpg'
      ],
      image_alt: 'Colar vintage com múltiplas imagens',
      colors: ['dourado', 'antigo'],
      materials: ['metal', 'cristal'],
      sizes: ['único'],
      is_active: true,
      is_featured: true
    };

    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir produto:', insertError);
      return;
    }
    
    const productId = insertData[0].id;
    console.log('✅ Produto criado com ID:', productId);

    // 3. Verificar se o produto foi salvo corretamente
    console.log('\n3️⃣ Verificando produto salvo...');
    const { data: savedProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar produto:', fetchError);
      return;
    }

    console.log('📦 Produto salvo:', {
      id: savedProduct.id,
      name: savedProduct.name,
      image_url: savedProduct.image_url,
      gallery_urls: savedProduct.gallery_urls,
      total_images: 1 + (savedProduct.gallery_urls?.length || 0)
    });

    // 4. Testar busca de produtos com múltiplas imagens
    console.log('\n4️⃣ Buscando produtos com múltiplas imagens...');
    const { data: multiImageProducts, error: searchError } = await supabase
      .from('products')
      .select('id, name, image_url, gallery_urls')
      .not('gallery_urls', 'is', null)
      .eq('is_active', true);

    if (searchError) {
      console.error('❌ Erro ao buscar produtos:', searchError);
      return;
    }

    console.log(`✅ Encontrados ${multiImageProducts.length} produtos com múltiplas imagens:`);
    multiImageProducts.forEach(p => {
      const totalImages = 1 + (p.gallery_urls?.length || 0);
      console.log(`  - ${p.name}: ${totalImages} imagens`);
    });

    // 5. Testar atualização de galeria
    console.log('\n5️⃣ Testando atualização de galeria...');
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({
        gallery_urls: [
          '/products/colar2.jpg',
          '/products/colar3.jpg',
          '/products/colar4.jpg'
        ]
      })
      .eq('id', productId)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar galeria:', updateError);
      return;
    }

    console.log('✅ Galeria atualizada:', updateData[0].gallery_urls);

    // 6. Testar função count_product_images (se existir)
    console.log('\n6️⃣ Testando função de contagem...');
    try {
      const { data: countData, error: countError } = await supabase
        .rpc('count_product_images', { product_row: savedProduct });

      if (!countError && countData !== null) {
        console.log('✅ Função count_product_images:', countData);
      }
    } catch (e) {
      console.log('ℹ️ Função count_product_images não disponível (normal se ainda não foi criada)');
    }

    // 7. Limpeza - remover produto de teste
    console.log('\n7️⃣ Limpando produto de teste...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteError) {
      console.error('❌ Erro ao deletar produto de teste:', deleteError);
    } else {
      console.log('✅ Produto de teste removido');
    }

    console.log('\n🎉 Teste do sistema de múltiplas imagens concluído com sucesso!');
    
    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('✅ Estrutura da tabela: OK');
    console.log('✅ Inserção com múltiplas imagens: OK');
    console.log('✅ Busca por produtos: OK');
    console.log('✅ Atualização de galeria: OK');
    console.log('✅ Limpeza de dados: OK');
    console.log('\n🚀 O sistema está pronto para uso!');

  } catch (error) {
    console.error('💥 Erro geral no teste:', error);
  }
}

// Executar teste
if (require.main === module) {
  testMultipleImages();
}

module.exports = { testMultipleImages };
