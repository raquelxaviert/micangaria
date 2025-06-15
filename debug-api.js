const https = require('https');

// Teste simples da API create-preference
const testData = {
  items: [
    {
      id: 'anel',
      title: 'Anel Vintage',
      quantity: 1,
      unit_price: 50.00
    }
  ],
  shippingOption: {
    id: 'correios',
    name: 'Correios PAC',
    price: '15.50',
    delivery_time: '5-10 dias'
  },
  customerInfo: {
    name: 'João Teste',
    email: 'cliente@teste.com',
    phone: '11999999999',
    document: '12345678909'
  },
  shippingAddress: {
    address: 'Rua Teste, 123',
    number: '123',
    postal_code: '01310100',
    city: 'São Paulo',
    state: 'SP'
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 9002,
  path: '/api/checkout/create-preference',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testando API create-preference...');
console.log('📦 Dados enviados:', testData);

const req = https.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('📦 Resposta completa:');
    try {
      const jsonResponse = JSON.parse(responseBody);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('❌ Erro ao parsear JSON:', responseBody);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error);
});

req.write(postData);
req.end();
