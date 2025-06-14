const testPreference = async () => {
  try {
    console.log('🧪 Testando criação de preferência...');
    
    const testData = {
      items: [
        {
          id: 'test-1',
          title: 'Produto Teste',
          quantity: 1,
          unit_price: 10.99,
          currency_id: 'BRL'
        }
      ],
      shippingOption: {
        type: 'sedex',
        price: 15.00,
        time: '5-7 dias'
      },
      customerInfo: {
        name: 'João Silva',
        email: 'joao@teste.com',
        phone: '11999999999'
      },
      shippingAddress: {
        street: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      }
    };

    const response = await fetch('http://localhost:9002/api/checkout/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📋 Status da resposta:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📋 Dados da resposta:', JSON.stringify(data, null, 2));

    if (data.payment_methods) {
      console.log('💳 Métodos de pagamento disponíveis:');
      data.payment_methods.forEach(method => {
        console.log(`- ${method.id}: ${method.name}`);
      });
    }

    if (data.payment_types) {
      console.log('💰 Tipos de pagamento disponíveis:');
      data.payment_types.forEach(type => {
        console.log(`- ${type.id}: ${type.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

// Executar se for chamado diretamente
if (require.main === module) {
  testPreference();
}

module.exports = testPreference;
