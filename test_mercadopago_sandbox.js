/**
 * 🧪 TESTE MERCADO PAGO SANDBOX
 * 
 * Verifica se as credenciais de teste estão funcionando corretamente
 */

const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configurar Mercado Pago com credenciais de teste
const accessToken = 'APP_USR-1462764550696594-061211-e1e1043f436264c9bf3ff42860b3a608-2490474713';

console.log('🧪 TESTANDO MERCADO PAGO SANDBOX');
console.log('=' .repeat(50));

// Verificar se é token de teste
const isTestToken = accessToken.includes('TEST') || accessToken.includes('APP_USR');
console.log('🔍 Token é de teste?', isTestToken ? '✅ SIM' : '❌ NÃO');
console.log('🔑 Token:', accessToken.substring(0, 20) + '...');

const client = new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
  }
});

const preference = new Preference(client);

async function testPreference() {
  try {
    console.log('\n💳 Criando preferência de teste...');
    
    // Dados de teste válidos
    const preferenceData = {
      items: [
        {
          id: 'test-product',
          title: 'Produto de Teste',
          quantity: 1,
          unit_price: 100,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: 'Test User',
        email: 'test_user_297518619@testuser.com', // Email de teste oficial
        phone: {
          area_code: '11',
          number: '999999999'
        },
        identification: {
          type: 'CPF',
          number: '12345678901'
        }
      },
      back_urls: {
        success: 'http://localhost:9002/checkout/success',
        failure: 'http://localhost:9002/checkout/failure',
        pending: 'http://localhost:9002/checkout/pending'
      },
      external_reference: `TEST-${Date.now()}`,
      notification_url: 'http://localhost:9002/api/webhooks/mercadopago'
    };

    const response = await preference.create({ body: preferenceData });
    
    console.log('✅ SUCESSO! Preferência criada:', response.id);
    console.log('🔗 Sandbox URL:', response.sandbox_init_point);
    console.log('🔗 Production URL:', response.init_point);
    
    // Verificar se temos sandbox_init_point (indicativo de ambiente de teste)
    if (response.sandbox_init_point) {
      console.log('✅ Ambiente de TESTE detectado corretamente');
      console.log('🌐 Use esta URL para testar:', response.sandbox_init_point);
    } else {
      console.log('⚠️ Ambiente de PRODUÇÃO detectado');
      console.log('🌐 URL de produção:', response.init_point);
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.message.includes('test')) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('- Certifique-se de usar credenciais de TESTE válidas');
      console.log('- Verifique se o usuário pagador é de teste');
      console.log('- Use emails de teste do Mercado Pago');
    }
  }
}

testPreference();
