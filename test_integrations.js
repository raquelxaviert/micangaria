// Script de teste para verificar as integrações de pagamento e frete

// Para testar este script, rode: node test_integrations.js

const axios = require('axios');

// Configurações de teste
const baseURL = 'http://localhost:3000';
const testCEP = '01310-100'; // CEP da Av. Paulista, SP

// Produtos de teste
const testProducts = [
  {
    id: '1',
    name: 'Vestido Vintage Anos 80',
    type: 'vestido', 
    price: 189.90,
    quantity: 1
  },
  {
    id: '2',
    name: 'Blusa Saint Laurent Vintage',
    type: 'blusa',
    price: 299.90,
    quantity: 1
  }
];

// Dados do cliente de teste
const testCustomer = {
  email: 'test@exemplo.com',
  firstName: 'João',
  lastName: 'Silva',
  cpf: '12345678909'
};

async function testShippingCalculation() {
  console.log('🚚 Testando cálculo de frete...');
  
  try {
    const shippingData = {
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
        postal_code: testCEP.replace('-', ''),
        city: 'São Paulo',
        state_abbr: 'SP',
        country_id: 'BR'
      },
      products: testProducts.map(product => ({
        id: product.id,
        quantity: product.quantity,
        unitary_value: product.price,
        height: 3,
        width: 25,
        length: 30,
        weight: 0.3
      }))
    };

    const response = await axios.post(`${baseURL}/api/shipping/calculate`, shippingData);
    
    console.log('✅ Frete calculado com sucesso!');
    console.log('Opções encontradas:', response.data.data.length);
    
    response.data.data.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.name} - ${option.company.name}`);
      console.log(`     Preço: R$ ${option.price}`);
      console.log(`     Prazo: ${option.delivery_time} dias úteis`);
    });
    
    return response.data.data[0]; // Retorna primeira opção
    
  } catch (error) {
    console.error('❌ Erro no cálculo de frete:', error.response?.data || error.message);
    return null;
  }
}

async function testPaymentPreference() {
  console.log('\n💳 Testando criação de preferência de pagamento...');
  
  try {
    const preference = {
      items: testProducts.map(product => ({
        title: product.name,
        unit_price: product.price,
        quantity: product.quantity,
        description: `${product.name} - RÜGE Vintage`
      })),
      payer: {
        email: testCustomer.email,
        first_name: testCustomer.firstName,
        last_name: testCustomer.lastName
      },
      back_urls: {
        success: `${baseURL}/payment/success`,
        failure: `${baseURL}/payment/failure`,
        pending: `${baseURL}/payment/pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      notification_url: `${baseURL}/api/payment/webhook`
    };

    const response = await axios.post(`${baseURL}/api/payment/create-preference`, preference);
    
    console.log('✅ Preferência criada com sucesso!');
    console.log('ID da preferência:', response.data.id);
    console.log('Link de pagamento:', response.data.init_point || response.data.sandbox_init_point);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error.response?.data || error.message);
    return null;
  }
}

async function testPixPayment() {
  console.log('\n🎯 Testando pagamento PIX...');
  
  try {
    const total = testProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    const pixData = {
      amount: total,
      description: `Compra RÜGE - ${testProducts.length} item(s)`,
      email: testCustomer.email,
      firstName: testCustomer.firstName,
      lastName: testCustomer.lastName,
      identificationType: 'CPF',
      identificationNumber: testCustomer.cpf
    };

    const response = await axios.post(`${baseURL}/api/payment/pix`, pixData);
    
    console.log('✅ PIX gerado com sucesso!');
    console.log('ID do pagamento:', response.data.id);
    console.log('Status:', response.data.status);
    console.log('QR Code disponível:', response.data.qr_code ? 'Sim' : 'Não');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PIX:', error.response?.data || error.message);
    return null;
  }
}

async function testCEPValidation() {
  console.log('\n📍 Testando validação de CEP...');
  
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${testCEP.replace('-', '')}/json/`);
    
    if (response.data.erro) {
      console.log('❌ CEP não encontrado');
      return null;
    }
    
    console.log('✅ CEP válido!');
    console.log(`Endereço: ${response.data.logradouro}, ${response.data.bairro}`);
    console.log(`Cidade: ${response.data.localidade} - ${response.data.uf}`);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Erro ao validar CEP:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🧪 INICIANDO TESTES DE INTEGRAÇÃO\n');
  console.log('=====================================');
  
  // Teste 1: Validação de CEP
  await testCEPValidation();
  
  // Teste 2: Cálculo de frete
  const shippingOption = await testShippingCalculation();
  
  // Teste 3: Criação de preferência de pagamento
  const paymentPreference = await testPaymentPreference();
  
  // Teste 4: Geração de PIX
  const pixPayment = await testPixPayment();
  
  console.log('\n=====================================');
  console.log('🏁 TESTES CONCLUÍDOS!');
  
  // Resumo
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`✅ Validação CEP: ${testCEP}`);
  console.log(`✅ Frete: ${shippingOption ? 'Funcionando' : 'Erro'}`);
  console.log(`✅ Pagamento Cartão: ${paymentPreference ? 'Funcionando' : 'Erro'}`);
  console.log(`✅ PIX: ${pixPayment ? 'Funcionando' : 'Erro'}`);
  
  if (shippingOption && paymentPreference && pixPayment) {
    console.log('\n🎉 TODAS AS INTEGRAÇÕES ESTÃO FUNCIONANDO!');
    console.log('Você pode acessar: http://localhost:3000/checkout-demo');
  } else {
    console.log('\n⚠️  ALGUMAS INTEGRAÇÕES PRECISAM DE CONFIGURAÇÃO');
    console.log('Verifique as variáveis de ambiente e credenciais');
  }
}

// Executar testes apenas se for chamado diretamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testShippingCalculation,
  testPaymentPreference,
  testPixPayment,
  testCEPValidation
};
