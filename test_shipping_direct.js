/**
 * Teste direto da API de shipping
 */
const fetch = require('node-fetch');

async function testShippingAPI() {
  console.log('🧪 Testando API de shipping...');
  
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
        height: 5,
        length: 30,
        weight: 0.3,
        insurance_value: 189.90,
        quantity: 1,
        unitary_value: 189.90
      }
    ]
  };

  try {
    const response = await fetch('http://localhost:9002/api/shipping/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ SUCESSO!');
    console.log('Estrutura da resposta:', JSON.stringify(result, null, 2));
    
    if (result.data && Array.isArray(result.data)) {
      console.log(`📦 ${result.data.length} opções encontradas:`);
      result.data.forEach((option, index) => {
        console.log(`${index + 1}. ${option.name} - R$ ${option.price} (${option.delivery_time} dias)`);
      });
    } else {
      console.log('⚠️  Estrutura inesperada:', result);
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testShippingAPI();
