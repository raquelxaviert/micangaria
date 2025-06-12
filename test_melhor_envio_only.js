// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

// Teste específico do Melhor Envio
const testMelhorEnvio = async () => {
  console.log('🚀 TESTANDO MELHOR ENVIO...\n');
  
  // 1. Testar token
  console.log('1️⃣ Verificando token...');
  const token = process.env.MELHOR_ENVIO_TOKEN;
  
  if (!token) {
    console.log('❌ Token não encontrado no .env.local');
    console.log('📝 Verifique se o arquivo .env.local existe e tem MELHOR_ENVIO_TOKEN=...');
    return;
  }
  
  console.log('✅ Token encontrado:', token.substring(0, 50) + '...\n');
  
  // 2. Testar conexão com API
  console.log('2️⃣ Testando conexão com API...');
  
  const apiUrl = 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate';
  
  const testData = {
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
      postal_code: '20040020',
      address: 'Praça XV de Novembro',
      number: '48',
      district: 'Centro',
      city: 'Rio de Janeiro',
      state_abbr: 'RJ',
      country_id: 'BR'
    },
    products: [
      {
        id: '1',
        width: 25,
        height: 3,
        length: 30,
        weight: 0.3,
        insurance_value: 189.90,
        quantity: 1
      }
    ],
    options: {
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      insurance_value: 189.90,
      services: '1,2,3,4,7,8,9,10,11,12,17,18'
    }
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'RUGE Vintage Store (contato@rugebrecho.com)'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Status da resposta:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na API:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Conexão funcionando!\n');
    
    // 3. Mostrar resultados
    console.log('3️⃣ Opções de frete encontradas:');
    console.log('=' .repeat(50));
    
    if (Array.isArray(data)) {
      data.forEach((option, index) => {
        console.log(`${index + 1}. ${option.name || 'Serviço'}`);
        console.log(`   Empresa: ${option.company?.name || 'N/A'}`);
        console.log(`   Preço: R$ ${option.price || option.custom_price || 'N/A'}`);
        console.log(`   Prazo: ${option.delivery_time || 'N/A'} dias úteis`);
        console.log('');
      });
    } else if (typeof data === 'object') {
      Object.values(data).forEach((option, index) => {
        console.log(`${index + 1}. ${option.name || 'Serviço'}`);
        console.log(`   Empresa: ${option.company?.name || 'N/A'}`);
        console.log(`   Preço: R$ ${option.price || option.custom_price || 'N/A'}`);
        console.log(`   Prazo: ${option.delivery_time || 'N/A'} dias úteis`);
        console.log('');
      });
    } else {
      console.log('📦 Resposta:', JSON.stringify(data, null, 2));
    }
    
    console.log('🎉 TESTE MELHOR ENVIO: SUCESSO!');
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
};

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

// Executar teste
testMelhorEnvio().catch(console.error);
