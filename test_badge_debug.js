/**
 * Teste para debugar o sistema de badges
 * Verifica se a lógica de exibição está funcionando
 */

console.log('🔍 Teste de Debug - Sistema de Badges');

// Simular produto com badges desabilitados
const productWithDisabledBadges = {
  id: '1',
  name: 'Produto Teste',
  colors: ['Dourado', 'Prateado'],
  materials: ['Couro', 'Metal'],
  sizes: ['P', 'M', 'G'],
  show_colors_badge: false,
  show_materials_badge: false,
  show_sizes_badge: false
};

// Simular produto com badges habilitados
const productWithEnabledBadges = {
  id: '2',
  name: 'Produto Teste 2',
  colors: ['Verde', 'Azul'],
  materials: ['Algodão', 'Seda'],
  sizes: ['Único'],
  show_colors_badge: true,
  show_materials_badge: true,
  show_sizes_badge: true
};

// Simular produto sem configuração de badges (deve usar default)
const productWithoutBadgeConfig = {
  id: '3',
  name: 'Produto Teste 3',
  colors: ['Vermelho'],
  materials: ['Plástico'],
  sizes: ['GG']
  // Sem show_*_badge definido
};

function testBadgeLogic(product, description) {
  console.log(`\n📋 Testando: ${description}`);
  console.log(`Product: ${product.name}`);
  
  // Replicar a lógica do ProductCard
  const shouldShowMaterials = product.show_materials_badge !== false && product.materials && product.materials.length > 0;
  const shouldShowSizes = product.show_sizes_badge !== false && product.sizes && product.sizes.length > 0;
  const shouldShowColors = product.show_colors_badge !== false && product.colors && product.colors.length > 0;
  
  console.log(`Materials Badge: ${shouldShowMaterials ? '✅ SHOW' : '❌ HIDE'} (config: ${product.show_materials_badge}, has data: ${product.materials?.length > 0})`);
  console.log(`Sizes Badge: ${shouldShowSizes ? '✅ SHOW' : '❌ HIDE'} (config: ${product.show_sizes_badge}, has data: ${product.sizes?.length > 0})`);
  console.log(`Colors Badge: ${shouldShowColors ? '✅ SHOW' : '❌ HIDE'} (config: ${product.show_colors_badge}, has data: ${product.colors?.length > 0})`);
}

testBadgeLogic(productWithDisabledBadges, 'Produto com badges DESABILITADOS');
testBadgeLogic(productWithEnabledBadges, 'Produto com badges HABILITADOS');
testBadgeLogic(productWithoutBadgeConfig, 'Produto SEM configuração (deve usar default TRUE)');

console.log('\n💡 Explicação da lógica:');
console.log('- show_badge !== false: Se não for explicitamente false, mostra (default = true)');
console.log('- Para OCULTAR um badge: precisa ser explicitamente false');
console.log('- Para MOSTRAR um badge: pode ser true, undefined, ou null');
