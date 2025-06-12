// Teste da sua API Next.js /api/shipping/calculate
// Execute: node teste_sua_api.js

async function testarSuaAPI() {
  console.log('🔥 TESTANDO SUA API NEXT.JS');
  console.log('═══════════════════════════');
  
  const dadosEnvio = {
    from: {
      postal_code: '01310100',
      address: 'Avenida Paulista',
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state_abbr: 'SP'
    },
    to: {
      postal_code: '20040020',
      address: 'Avenida Rio Branco', 
      district: 'Centro',
      city: 'Rio de Janeiro',
      state_abbr: 'RJ'
    },
    products: [{
      width: 20,
      height: 10,
      length: 30,
      weight: 1.5,
      unitary_value: 150.00,
      quantity: 1
    }]
  };

  try {
    console.log('📡 Fazendo requisição para sua API...');
    
    const response = await fetch('http://localhost:9002/api/shipping/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosEnvio)
    });

    if (!response.ok) {
      console.log('❌ Erro na API:', response.status, response.statusText);
      const texto = await response.text();
      console.log('Detalhes:', texto);
      return;
    }

    const resultado = await response.json();
    
    console.log('✅ SUA API FUNCIONOU!');
    console.log('═══════════════════════');
    console.log(`📦 Opções encontradas: ${resultado.data?.length || 0}`);
    
    if (resultado.data && resultado.data.length > 0) {
      resultado.data.forEach((opcao, i) => {
        console.log(`\n${i + 1}. ${opcao.name}`);
        console.log(`   💰 Preço: R$ ${opcao.price}`);
        console.log(`   ⏱️  Prazo: ${opcao.delivery_time} dias`);
        console.log(`   🚚 Empresa: ${opcao.company?.name}`);
        console.log(`   🎯 ID: ${opcao.id}`);
      });
      
      console.log('\n🎉 PERFEITO! Sua API está funcionando!');
      console.log('Agora você pode usar no frontend! 🚀');
    } else {
      console.log('⚠️ API funcionou mas não retornou dados');
    }

  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
    console.log('Certifique-se que o servidor está rodando: npm run dev');
  }
}

testarSuaAPI();
