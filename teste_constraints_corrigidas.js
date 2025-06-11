// Teste simples para verificar se constraints foram corrigidas
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://koduoglrfzronbcgqrjc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI'
);

async function testarConstraints() {
  console.log('🧪 TESTE: Verificando se constraints foram corrigidas\n');

  try {
    // Tentar inserir produto com tipo que estava dando erro
    console.log('1️⃣ Testando inserção com tipo "colar"...');
    const { data: produto1, error: erro1 } = await supabase
      .from('products')
      .insert([{
        name: 'TESTE Constraints - Colar',
        description: 'Produto para testar se constraints foram corrigidas',
        price: 99.99,
        type: 'colar',  // Este tipo estava dando erro antes
        style: 'boho',   // Este estilo estava dando erro antes
        colors: ['dourado'],
        is_active: true
      }])
      .select();

    if (erro1) {
      console.error('❌ ERRO ainda existe:', erro1.message);
      console.error('💡 Você precisa executar o SQL fix_constraints_smart.sql no Supabase primeiro!');
      return;
    }

    console.log('✅ Sucesso! Produto inserido:', produto1[0].name);
    console.log('   ID:', produto1[0].id);
    console.log('   SKU:', produto1[0].sku);
    console.log('   Tipo:', produto1[0].type);
    console.log('   Estilo:', produto1[0].style);

    // Testar tipo personalizado
    console.log('\n2️⃣ Testando tipo personalizado "jaqueta"...');
    const { data: produto2, error: erro2 } = await supabase
      .from('products')
      .insert([{
        name: 'TESTE Constraints - Jaqueta',
        description: 'Produto com tipo personalizado',
        price: 199.99,
        type: 'jaqueta',  // TIPO PERSONALIZADO
        style: 'rock',    // ESTILO PERSONALIZADO
        colors: ['preto'],
        is_active: true
      }])
      .select();

    if (erro2) {
      console.error('❌ ERRO com tipo personalizado:', erro2.message);
      return;
    }

    console.log('✅ Sucesso! Tipo personalizado funciona:', produto2[0].name);
    console.log('   Tipo personalizado:', produto2[0].type);
    console.log('   Estilo personalizado:', produto2[0].style);

    // Verificar se aparecem na busca de tipos únicos
    console.log('\n3️⃣ Verificando tipos únicos disponíveis...');
    const { data: tipos } = await supabase
      .from('products')
      .select('type')
      .not('type', 'is', null);

    const tiposUnicos = [...new Set(tipos.map(p => p.type))];
    console.log('📋 Tipos encontrados no banco:');
    tiposUnicos.forEach(tipo => {
      const ehPersonalizado = !['colar', 'anel', 'brinco', 'pulseira', 'bolsa', 'cinto', 'sandalia', 'acessorio', 'conjunto'].includes(tipo);
      const icone = ehPersonalizado ? '🏷️' : '📦';
      console.log(`   ${icone} ${tipo}`);
    });

    console.log('\n🎯 RESULTADO FINAL:');
    console.log('✅ Constraints corrigidas com sucesso!');
    console.log('✅ Tipos padrão funcionam normalmente');
    console.log('✅ Tipos personalizados podem ser criados livremente');
    console.log('✅ Sistema está pronto para uso no admin!');

    // Limpeza
    console.log('\n🧹 Removendo produtos de teste...');
    await supabase.from('products').delete().eq('id', produto1[0].id);
    await supabase.from('products').delete().eq('id', produto2[0].id);
    console.log('✅ Limpeza concluída');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('💡 Certifique-se de que executou o SQL fix_constraints_smart.sql no Supabase');
  }
}

testarConstraints();
