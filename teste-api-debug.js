/**
 * 🔍 Teste para diagnosticar erro na API do checkout
 */

async function testarAPI() {
  const dadosTest = {
    items: [
      {
        id: "1",
        title: "Produto Teste",
        quantity: 1,
        unit_price: 50.00
      }
    ],
    shippingOption: {
      name: "PAC",
      price: "15.50",
      delivery_time: "5-7 dias úteis"
    },
    customerInfo: {
      name: "João Silva",
      email: "joao.teste@email.com",
      phone: "11999999999",
      document: "12345678909"
    },
    shippingAddress: {
      address: "Rua Teste",
      number: "123",
      postal_code: "01310100",
      city: "São Paulo",
      state: "SP"
    }
  };

  try {
    console.log('🚀 Testando API de checkout...');
    console.log('📦 Dados enviados:', JSON.stringify(dadosTest, null, 2));

    const response = await fetch('http://localhost:9002/api/checkout/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosTest)
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', [...response.headers.entries()]);

    const responseText = await response.text();
    console.log('📝 Resposta bruta:', responseText);

    try {
      const responseData = JSON.parse(responseText);
      console.log('✅ Resposta JSON:', responseData);
    } catch (e) {
      console.log('❌ Erro ao parsear JSON:', e.message);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

testarAPI();
