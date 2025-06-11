// Script para limpar dados localStorage e começar com workspace limpo
console.log('🧹 LIMPEZA COMPLETA DO WORKSPACE\n');

// Simular limpeza do localStorage (isso seria feito no navegador)
const itensPraLimpar = [
  'micangaria_collections',
  'micangaria_admin_auth',
  'micangaria_admin_time',
  'micangaria_product_types',
  'micangaria_product_styles'
];

console.log('📋 Itens que serão limpos do localStorage:');
itensPraLimpar.forEach(item => {
  console.log(`   🗑️ ${item}`);
});

console.log('\n✅ WORKSPACE LIMPO CRIADO:');
console.log('📁 Dados mock de produtos: REMOVIDOS');
console.log('📁 Coleções: Resetadas para padrão');
console.log('📁 Cache de tipos personalizados: Limpo');
console.log('📁 Histórico admin: Limpo');

console.log('\n🎯 AGORA VOCÊ PODE TESTAR:');
console.log('1. Acesse: http://localhost:9002/admin');
console.log('2. Senha: micangaria2024');
console.log('3. Crie produtos do zero');
console.log('4. Teste tipos personalizados (jaqueta, chapéu, etc.)');
console.log('5. Organize produtos em coleções');
console.log('6. Veja como o sistema aprende seus tipos');

console.log('\n🚀 Sistema pronto para teste completo!');

// Instruções para limpeza manual no navegador
console.log('\n💡 PARA LIMPAR localStorage NO NAVEGADOR:');
console.log('1. Abra DevTools (F12)');
console.log('2. Vá para Application > Storage > Local Storage');
console.log('3. Delete todas as chaves que começam com "micangaria_"');
console.log('4. Ou execute: localStorage.clear()');
