// Teste visual para mostrar como os tipos personalizados aparecem
// Execute este script para ver como o sistema descobre tipos existentes

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://koduoglrfzronbcgqrjc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI'
);

async function demonstrarTiposPersonalizados() {
  console.log('🧪 DEMONSTRAÇÃO: Como o sistema descobre tipos personalizados\n');

  try {
    // 1. Criar produto com tipo personalizado "Jaqueta"
    console.log('1️⃣ Criando produto com tipo personalizado "jaqueta"...');
    const { data: produto, error: erroInsert } = await supabase
      .from('products')
      .insert([{
        name: 'Jaqueta Vintage Couro',
        description: 'Jaqueta de couro estilo vintage anos 80',
        price: 299.99,
        type: 'jaqueta',  // TIPO PERSONALIZADO!
        style: 'vintage',
        colors: ['marrom', 'couro'],
        is_active: true
      }])
      .select();

    if (erroInsert) {
      console.error('❌ Erro ao criar produto:', erroInsert.message);
      return;
    }

    console.log('✅ Produto criado:', produto[0].name, '- Tipo:', produto[0].type);

    // 2. Buscar todos os tipos únicos utilizados
    console.log('\n2️⃣ Buscando todos os tipos utilizados no banco...');
    const { data: tiposUsados, error: erroBusca } = await supabase
      .from('products')
      .select('type')
      .not('type', 'is', null);

    if (erroBusca) {
      console.error('❌ Erro ao buscar tipos:', erroBusca.message);
      return;
    }

    // 3. Extrair tipos únicos
    const tiposUnicos = [...new Set(tiposUsados.map(p => p.type))];
    
    console.log('📋 Tipos encontrados no banco de dados:');
    tiposUnicos.forEach((tipo, index) => {
      const ehPersonalizado = !['colar', 'anel', 'brinco', 'pulseira', 'bolsa', 'cinto', 'sandalia', 'acessorio', 'conjunto'].includes(tipo);
      const icone = ehPersonalizado ? '🏷️' : '📦';
      const label = ehPersonalizado ? '(PERSONALIZADO)' : '(PADRÃO)';
      console.log(`   ${icone} ${tipo} ${label}`);
    });

    // 4. Simular o que o componente SmartSelect mostraria
    console.log('\n3️⃣ Como apareceria no dropdown do SmartSelect:');
    console.log('┌─ Tipos Padrão:');
    ['colar', 'anel', 'brinco', 'pulseira', 'bolsa'].forEach(tipo => {
      console.log(`│  📦 ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    });
    
    console.log('├─ Tipos Personalizados:');
    const tiposPersonalizados = tiposUnicos.filter(tipo => 
      !['colar', 'anel', 'brinco', 'pulseira', 'bolsa', 'cinto', 'sandalia', 'acessorio', 'conjunto'].includes(tipo)
    );
    
    if (tiposPersonalizados.length > 0) {
      tiposPersonalizados.forEach(tipo => {
        console.log(`│  🏷️ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} (Personalizado)`);
      });
    } else {
      console.log('│  (Nenhum tipo personalizado ainda)');
    }
    
    console.log('└─ ➕ Adicionar novo...');

    // 5. Demonstrar criação de outro tipo
    console.log('\n4️⃣ Criando produto com outro tipo personalizado "chapeu"...');
    const { data: produto2, error: erroInsert2 } = await supabase
      .from('products')
      .insert([{
        name: 'Chapéu Boho Palha',
        description: 'Chapéu estilo boho feito de palha natural',
        price: 89.99,
        type: 'chapeu',  // OUTRO TIPO PERSONALIZADO!
        style: 'boho',
        colors: ['natural', 'palha'],
        is_active: true
      }])
      .select();

    if (erroInsert2) {
      console.error('❌ Erro ao criar segundo produto:', erroInsert2.message);
      return;
    }

    console.log('✅ Segundo produto criado:', produto2[0].name, '- Tipo:', produto2[0].type);

    // 6. Buscar novamente para mostrar que agora temos mais tipos
    console.log('\n5️⃣ Lista atualizada de tipos (após criar "chapeu"):');
    const { data: tiposAtualizados } = await supabase
      .from('products')
      .select('type')
      .not('type', 'is', null);

    const tiposUnicosAtualizados = [...new Set(tiposAtualizados.map(p => p.type))];
    
    tiposUnicosAtualizados.forEach((tipo, index) => {
      const ehPersonalizado = !['colar', 'anel', 'brinco', 'pulseira', 'bolsa', 'cinto', 'sandalia', 'acessorio', 'conjunto'].includes(tipo);
      const icone = ehPersonalizado ? '🏷️' : '📦';
      const label = ehPersonalizado ? '(PERSONALIZADO)' : '(PADRÃO)';
      console.log(`   ${icone} ${tipo} ${label}`);
    });

    console.log('\n🎯 RESUMO:');
    console.log('✅ Sistema descobre automaticamente tipos personalizados');
    console.log('✅ Tipos aparecem no dropdown para reutilização');
    console.log('✅ Diferenciação visual entre padrão e personalizado');
    console.log('✅ Sem necessidade de configuração manual');

    // 7. Limpeza
    console.log('\n🧹 Removendo produtos de teste...');
    await supabase.from('products').delete().eq('id', produto[0].id);
    await supabase.from('products').delete().eq('id', produto2[0].id);
    console.log('✅ Produtos de teste removidos');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

demonstrarTiposPersonalizados();
