/**
 * Debug: Problema com badges não aparecendo quando configurados como true
 * Vamos testar especificamente produtos com badges=true e dados presentes
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://koduoglrfzronbcgqrjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NDk5NjIsImV4cCI6MjA1MTUyNTk2Mn0.Cg9Tw74VFH7VEcJGDWdgKN5T-_yv1DUFNEcGy-dRMw4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBadgeIssue() {
  console.log('🔍 DEBUG: Badges não aparecendo quando true');
  console.log('=========================================\n');

  try {
    // Buscar produtos com badges=true e dados presentes
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, colors, materials, sizes, show_colors_badge, show_materials_badge, show_sizes_badge')
      .eq('show_colors_badge', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('📋 Nenhum produto encontrado com show_colors_badge = true');
      return;
    }

    console.log(`📊 Produtos com show_colors_badge = true: ${products.length}\n`);

    products.forEach((product, index) => {
      console.log(`📦 Produto ${index + 1}: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      
      // Verificar dados
      console.log(`   🧱 Dados disponíveis:`);
      console.log(`      - colors: ${JSON.stringify(product.colors)} (length: ${product.colors?.length || 0})`);
      console.log(`      - materials: ${JSON.stringify(product.materials)} (length: ${product.materials?.length || 0})`);
      console.log(`      - sizes: ${JSON.stringify(product.sizes)} (length: ${product.sizes?.length || 0})`);
      
      // Verificar configurações
      console.log(`   ⚙️ Configurações de badge:`);
      console.log(`      - show_colors_badge: ${product.show_colors_badge} (tipo: ${typeof product.show_colors_badge})`);
      console.log(`      - show_materials_badge: ${product.show_materials_badge} (tipo: ${typeof product.show_materials_badge})`);
      console.log(`      - show_sizes_badge: ${product.show_sizes_badge} (tipo: ${typeof product.show_sizes_badge})`);
      
      // Testar lógica ATUAL do ProductCard (=== true)
      console.log(`   🎨 Lógica ATUAL (=== true):`);
      const shouldShowColorsNew = product.show_colors_badge === true && product.colors && product.colors.length > 0;
      const shouldShowMaterialsNew = product.show_materials_badge === true && product.materials && product.materials.length > 0;
      const shouldShowSizesNew = product.show_sizes_badge === true && product.sizes && product.sizes.length > 0;
      
      console.log(`      - Colors: ${shouldShowColorsNew ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      console.log(`      - Materials: ${shouldShowMaterialsNew ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      console.log(`      - Sizes: ${shouldShowSizesNew ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      
      // Testar lógica ANTIGA (!== false)
      console.log(`   🎨 Lógica ANTIGA (!== false):`);
      const shouldShowColorsOld = product.show_colors_badge !== false && product.colors && product.colors.length > 0;
      const shouldShowMaterialsOld = product.show_materials_badge !== false && product.materials && product.materials.length > 0;
      const shouldShowSizesOld = product.show_sizes_badge !== false && product.sizes && product.sizes.length > 0;
      
      console.log(`      - Colors: ${shouldShowColorsOld ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      console.log(`      - Materials: ${shouldShowMaterialsOld ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      console.log(`      - Sizes: ${shouldShowSizesOld ? '✅ MOSTRAR' : '❌ OCULTAR'}`);
      
      // Identificar divergências
      if (shouldShowColorsNew !== shouldShowColorsOld || 
          shouldShowMaterialsNew !== shouldShowMaterialsOld || 
          shouldShowSizesNew !== shouldShowSizesOld) {
        console.log(`   ⚠️ DIVERGÊNCIA ENCONTRADA!`);
        if (shouldShowColorsNew !== shouldShowColorsOld) {
          console.log(`      Colors: Nova lógica ${shouldShowColorsNew ? 'mostra' : 'oculta'}, antiga ${shouldShowColorsOld ? 'mostra' : 'oculta'}`);
        }
        if (shouldShowMaterialsNew !== shouldShowMaterialsOld) {
          console.log(`      Materials: Nova lógica ${shouldShowMaterialsNew ? 'mostra' : 'oculta'}, antiga ${shouldShowMaterialsOld ? 'mostra' : 'oculta'}`);
        }
        if (shouldShowSizesNew !== shouldShowSizesOld) {
          console.log(`      Sizes: Nova lógica ${shouldShowSizesNew ? 'mostra' : 'oculta'}, antiga ${shouldShowSizesOld ? 'mostra' : 'oculta'}`);
        }
      } else {
        console.log(`   ✅ Ambas as lógicas concordam`);
      }
      
      console.log('   ' + '-'.repeat(60));
    });

    // Buscar produtos específicos com diferentes valores
    console.log('\n🔬 TESTE DE VALORES ESPECÍFICOS:');
    
    // Teste com produto que sabemos ter badges=true
    const { data: anelVintage, error: anelError } = await supabase
      .from('products')
      .select('id, name, colors, materials, sizes, show_colors_badge, show_materials_badge, show_sizes_badge')
      .eq('id', 'c31139ee-bd31-47af-98f2-7cf31820f8fd')
      .single();

    if (!anelError && anelVintage) {
      console.log(`\n📦 Teste específico: ${anelVintage.name}`);
      console.log(`   show_colors_badge: ${anelVintage.show_colors_badge} (${typeof anelVintage.show_colors_badge})`);
      console.log(`   colors: ${JSON.stringify(anelVintage.colors)}`);
      
      // Teste todas as condições
      console.log(`\n   🧪 Testando condições:`);
      console.log(`   - show_colors_badge === true: ${anelVintage.show_colors_badge === true}`);
      console.log(`   - colors existe: ${!!anelVintage.colors}`);
      console.log(`   - colors.length > 0: ${anelVintage.colors && anelVintage.colors.length > 0}`);
      console.log(`   - Condição completa: ${anelVintage.show_colors_badge === true && anelVintage.colors && anelVintage.colors.length > 0}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o debug
debugBadgeIssue().then(() => {
  console.log('\n🎯 ANÁLISE CONCLUÍDA');
});
