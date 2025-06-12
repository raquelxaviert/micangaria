// Teste SUPER SIMPLES do Melhor Envio
// Execute: node teste_rapido.js

require('dotenv').config({ path: '.env.local' });

const token = process.env.MELHOR_ENVIO_TOKEN;

console.log('🧪 TESTE RÁPIDO MELHOR ENVIO');
console.log('═══════════════════════════');
console.log(`Token configurado: ${token ? '✅ SIM' : '❌ NÃO'}`);
console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

if (!token) {
  console.log('❌ Token não encontrado no .env.local');
  process.exit(1);
}

// Dados de teste simples
const dadosTeste = {
  from: {
    postal_code: '01310100', // São Paulo
    city: 'São Paulo',
    state_abbr: 'SP'
  },
  to: {
    postal_code: '20040020', // Rio de Janeiro
    city: 'Rio de Janeiro', 
    state_abbr: 'RJ'
  },
  products: [{
    width: 20,
    height: 10, 
    length: 30,
    weight: 1.5,
    insurance_value: 100,
    quantity: 1
  }],
  options: {
    services: '1,2' // Apenas PAC e SEDEX
  }
};

async function testarMelhorEnvio() {
  try {
    console.log('\n🚚 Testando cálculo de frete...');
    
    const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Teste RÜGE (teste@teste.com)'
      },
      body: JSON.stringify(dadosTeste)
    });

    if (!response.ok) {
      const erro = await response.text();
      console.log('❌ Erro:', response.status, erro);
      return;
    }

    const resultado = await response.json();
    
    console.log('✅ SUCESSO! Opções encontradas:');
    console.log('═══════════════════════════════');
    
    Object.values(resultado).forEach((opcao, i) => {
      console.log(`${i + 1}. ${opcao.name}`);
      console.log(`   💰 Preço: R$ ${opcao.price}`);
      console.log(`   ⏱️  Prazo: ${opcao.delivery_time} dias`);
      console.log(`   🚚 Empresa: ${opcao.company?.name || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

testarMelhorEnvio();
