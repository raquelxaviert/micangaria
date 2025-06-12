const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const SANDBOX_API = 'https://sandbox.melhorenvio.com.br/api/v2';
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;

const CEPS_TESTE = [
  '01310-100', // SP - Paulista
  '20040-020', // RJ - Centro  
  '30112-000', // BH - Centro
  '13010-111'  // Campinas
];

async function testarCalculoFrete(cepDestino) {
  console.log(`🧪 Testando frete para CEP: ${cepDestino}`);
  
  const requestData = {
    from: {
      postal_code: '01310100',
      address: 'Avenida Paulista',
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state_abbr: 'SP',
      country_id: 'BR'
    },
    to: {
      postal_code: cepDestino.replace('-', ''),
      country_id: 'BR'
    },
    products: [{
      id: 'test-product-1',
      width: 25,
      height: 3,
      length: 30,
      weight: 0.3,
      insurance_value: 99.90,
      quantity: 1
    }],
    options: {
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      services: '1,2,3,4,7,8,9,10,11,12,17,18'
    }
  };

  try {
    const response = await fetch(`${SANDBOX_API}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'RUGE Test (contato@ruge.com.br)'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro ${response.status}:`, errorText);
      return;
    }

    const data = await response.json();
    console.log(`✅ Sucesso! Encontradas ${Object.keys(data).length} opções:`);
    
    // Ordenar por preço
    const opcoes = Object.values(data).sort((a, b) => {
      const precoA = parseFloat(a.custom_price || a.price || 999999);
      const precoB = parseFloat(b.custom_price || b.price || 999999);
      return precoA - precoB;
    });

    opcoes.forEach((opcao, index) => {
      const preco = parseFloat(opcao.custom_price || opcao.price);
      console.log(`  ${index + 1}. ${opcao.company.name} - ${opcao.name}`);
      console.log(`     💰 R$ ${preco.toFixed(2)} | ⏱️ ${opcao.delivery_time} dias`);
    });
    
    console.log('---');
    
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error.message);
  }
}

// Executar testes
async function executarTestes() {
  console.log('🚀 Iniciando testes do Sandbox Melhor Envio\n');
  
  for (const cep of CEPS_TESTE) {
    await testarCalculoFrete(cep);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa 1s entre requests
  }
  
  console.log('✅ Testes concluídos!');
}

executarTestes();
