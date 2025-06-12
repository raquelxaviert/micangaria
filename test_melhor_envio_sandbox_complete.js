/**
 * Script para testar a configuração do Melhor Envio Sandbox
 * 
 * Execute: node test_melhor_envio_sandbox_complete.js
 */

// Configuração do ambiente
const isSandbox = process.env.NODE_ENV === 'development' || process.env.MELHOR_ENVIO_SANDBOX === 'true';

const config = {
  apiUrl: isSandbox 
    ? 'https://sandbox.melhorenvio.com.br/api/v2' 
    : 'https://melhorenvio.com.br/api/v2',
  token: isSandbox 
    ? process.env.MELHOR_ENVIO_SANDBOX_TOKEN 
    : process.env.MELHOR_ENVIO_TOKEN
};

console.log('=== TESTE MELHOR ENVIO ===');
console.log(`Ambiente: ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'}`);
console.log(`URL: ${config.apiUrl}`);
console.log(`Token configurado: ${config.token ? 'SIM' : 'NÃO'}`);

// Dados de teste para cálculo de frete
const testData = {
  from: {
    postal_code: '01310100', // São Paulo - SP
    address: 'Avenida Paulista',
    number: '1000',
    district: 'Bela Vista',
    city: 'São Paulo',
    state_abbr: 'SP',
    country_id: 'BR'
  },
  to: {
    postal_code: '20040020', // Rio de Janeiro - RJ
    address: 'Avenida Rio Branco',
    number: '100',
    district: 'Centro',
    city: 'Rio de Janeiro',
    state_abbr: 'RJ',
    country_id: 'BR'
  },
  products: [
    {
      id: '1',
      width: 20,
      height: 10,
      length: 30,
      weight: 1.5,
      insurance_value: 150.00,
      quantity: 1,
      unitary_value: 150.00
    }
  ],
  options: {
    receipt: false,
    own_hand: false,
    reverse: false,
    non_commercial: false,
    insurance_value: 150.00,
    // SANDBOX: Limitado a Correios (1,2,17,18) e Jadlog (3,4)
    services: isSandbox 
      ? '1,2,17,18,3,4' // Apenas Correios e Jadlog no sandbox
      : '1,2,3,4,7,8,9,10,11,12,17,18' // Todos os serviços em produção
  }
};

async function testMelhorEnvio() {
  if (!config.token) {
    console.error('❌ TOKEN NÃO CONFIGURADO!');
    console.log('\n🔧 Configure as variáveis de ambiente:');
    console.log('- MELHOR_ENVIO_SANDBOX_TOKEN (para testes)');
    console.log('- MELHOR_ENVIO_TOKEN (para produção)');
    return;
  }

  try {
    console.log('\n🚚 Testando cálculo de frete...');
    
    const response = await fetch(`${config.apiUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.token}`,
        'User-Agent': 'TESTE Melhor Envio (teste@exemplo.com)'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status, response.statusText);
      console.error('Detalhes:', errorText);
      
      // Tentar parsear o erro como JSON
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          console.error('Mensagem:', errorJson.message);
        }
        if (errorJson.errors) {
          console.error('Erros:', errorJson.errors);
        }
      } catch (e) {
        // Erro não é JSON válido
      }
      
      return;
    }

    const data = await response.json();
    
    console.log('✅ Sucesso! Opções de frete encontradas:');
    console.log(`📦 Total de opções: ${Object.keys(data).length}`);
    
    Object.values(data).forEach((option, index) => {
      console.log(`\n${index + 1}. ${option.name}`);
      console.log(`   💰 Preço: R$ ${option.price}`);
      console.log(`   🚚 Transportadora: ${option.company?.name || 'N/A'}`);
      console.log(`   ⏱️  Prazo: ${option.delivery_time} dias úteis`);
      
      if (isSandbox) {
        console.log(`   🧪 SANDBOX: Esta é uma simulação`);
      }
    });

    // Informações específicas do Sandbox
    if (isSandbox) {
      console.log('\n🧪 INFORMAÇÕES DO SANDBOX:');
      console.log('- Saldo fictício: R$ 10.000,00');
      console.log('- Apenas Correios e Jadlog disponíveis');
      console.log('- Transações aprovadas automaticamente após 5 min');
      console.log('- Status modificados após 15 min');
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

// Testar informações do usuário autenticado
async function testUserInfo() {
  if (!config.token) return;
  
  try {
    console.log('\n👤 Testando informações do usuário...');
    
    const response = await fetch(`${config.apiUrl}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Usuário autenticado:', userData.firstname || userData.email || 'N/A');
      
      if (isSandbox) {
        console.log('🧪 Ambiente: SANDBOX (Testes)');
      } else {
        console.log('🚀 Ambiente: PRODUÇÃO');
      }
    } else {
      console.log('❌ Não foi possível obter informações do usuário');
    }
  } catch (error) {
    console.log('❌ Erro ao obter informações do usuário:', error.message);
  }
}

// Executar testes
async function runTests() {
  await testUserInfo();
  await testMelhorEnvio();
  
  console.log('\n📋 RESUMO:');
  console.log(`Ambiente: ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'}`);
  console.log(`URL: ${config.apiUrl}`);
  console.log(`Token: ${config.token ? '✅ Configurado' : '❌ Não configurado'}`);
}

runTests().catch(console.error);
