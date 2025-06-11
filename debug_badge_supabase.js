/**
 * Debug: Verificar produto específico no Supabase
 * Este script vai verificar se os campos de badge configuration estão corretos
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usando as mesmas variáveis do projeto)
const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugBadgeConfiguration() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÃO DE BADGES NO SUPABASE');
  console.log('================================================\n');

  try {
    // Buscar todos os produtos com os campos de badge
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, colors, materials, sizes, show_colors_badge, show_materials_badge, show_sizes_badge')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('📋 Nenhum produto encontrado no banco.');
      return;
    }

    console.log(`📊 Total de produtos encontrados: ${products.length}\n`);

    products.forEach((product, index) => {
      console.log(`📦 Produto ${index + 1}: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   🎨 Cores: ${JSON.stringify(product.colors || [])}`);
      console.log(`   🧱 Materiais: ${JSON.stringify(product.materials || [])}`);
      console.log(`   📏 Tamanhos: ${JSON.stringify(product.sizes || [])}`);
      console.log(`   🏷️ Badge Config:`);
      console.log(`      - show_colors_badge: ${product.show_colors_badge}`);
      console.log(`      - show_materials_badge: ${product.show_materials_badge}`);
      console.log(`      - show_sizes_badge: ${product.show_sizes_badge}`);
      
      // Simular a lógica do ProductCard
      const shouldShowColors = product.show_colors_badge !== false && product.colors && product.colors.length > 0;
      const shouldShowMaterials = product.show_materials_badge !== false && product.materials && product.materials.length > 0;
      const shouldShowSizes = product.show_sizes_badge !== false && product.sizes && product.sizes.length > 0;
      
      console.log(`   🎯 Como aparecerá no ProductCard:`);
      console.log(`      - Colors Badge: ${shouldShowColors ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      console.log(`      - Materials Badge: ${shouldShowMaterials ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      console.log(`      - Sizes Badge: ${shouldShowSizes ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      console.log('   ' + '-'.repeat(50));
    });

    // Identificar produtos problemáticos
    const problematicProducts = products.filter(p => {
      const hasData = (p.colors && p.colors.length > 0) || (p.materials && p.materials.length > 0) || (p.sizes && p.sizes.length > 0);
      const allBadgesDisabled = p.show_colors_badge === false && p.show_materials_badge === false && p.show_sizes_badge === false;
      return hasData && allBadgesDisabled;
    });

    if (problematicProducts.length > 0) {
      console.log('\n⚠️ PRODUTOS COM TODOS OS BADGES DESABILITADOS MAS COM DADOS:');
      problematicProducts.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
        console.log(`     Dados: cores=${p.colors?.length || 0}, materials=${p.materials?.length || 0}, sizes=${p.sizes?.length || 0}`);
        console.log(`     Configs: colors=${p.show_colors_badge}, materials=${p.show_materials_badge}, sizes=${p.show_sizes_badge}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o debug
debugBadgeConfiguration();
