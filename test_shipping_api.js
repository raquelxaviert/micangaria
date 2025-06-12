// Test shipping API locally
const fetch = require('node-fetch');

async function testShippingAPI() {
  console.log('🧪 Testing shipping API...');
  
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
      address: 'Rua Teste',
      number: '100',
      district: 'Centro',
      city: 'Rio de Janeiro',
      state_abbr: 'RJ',
      country_id: 'BR'
    },
    products: [{
      id: '1',
      width: 20,
      height: 5,
      length: 30,
      weight: 0.3,
      insurance_value: 100,
      quantity: 1,
      unitary_value: 100
    }]
  };

  try {
    console.log('📡 Making request to API...');
    const response = await fetch('http://localhost:9002/api/shipping/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testShippingAPI();
