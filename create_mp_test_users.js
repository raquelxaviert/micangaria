/**
 * 🧪 Script para criar usuários de teste no Mercado Pago
 * 
 * Este script ajuda a criar usuários de teste válidos para o sandbox
 */

const https = require('https');

// Configurações
const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1462764550696594-061211-e1e1043f436264c9bf3ff42860b3a608-2490474713';

async function createTestUsers() {
  console.log('🧪 CRIANDO USUÁRIOS DE TESTE NO MERCADO PAGO');
  console.log('================================================');
  
  try {
    // Dados para criar usuário vendedor
    const sellerData = {
      site_id: 'MLB',
      description: 'RUGE Store - Vendedor Teste'
    };

    // Dados para criar usuário comprador
    const buyerData = {
      site_id: 'MLB', 
      description: 'RUGE Store - Comprador Teste'
    };

    console.log('🔧 Criando usuário vendedor...');
    const seller = await createTestUser(sellerData);
    console.log('✅ Vendedor criado:', seller);

    console.log('\n🔧 Criando usuário comprador...');
    const buyer = await createTestUser(buyerData);
    console.log('✅ Comprador criado:', buyer);

    console.log('\n📋 RESUMO DOS USUÁRIOS CRIADOS:');
    console.log('=====================================');
    console.log('VENDEDOR:');
    console.log(`Email: ${seller.email}`);
    console.log(`ID: ${seller.id}`);
    console.log(`Access Token: ${seller.access_token}`);
    
    console.log('\nCOMPRADOR:');
    console.log(`Email: ${buyer.email}`);
    console.log(`ID: ${buyer.id}`);

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Use o email do COMPRADOR no seu checkout');
    console.log('2. Use o access_token do VENDEDOR nas suas APIs');
    console.log('3. Teste pagamentos com cartões de teste');

    return { seller, buyer };

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error.message);
    
    console.log('\n💡 SOLUÇÃO ALTERNATIVA:');
    console.log('1. Acesse: https://www.mercadopago.com.br/developers/panel/app');
    console.log('2. Vá em "Contas de teste"');
    console.log('3. Clique em "Criar conta de teste"');
    console.log('4. Crie um vendedor e um comprador');
    console.log('5. Use os dados gerados no seu checkout');
  }
}

function createTestUser(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData);
    
    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path: '/users/test_user',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 201) {
            resolve(response);
          } else {
            reject(new Error(`API Error: ${response.message || data}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUsers().catch(console.error);
}

module.exports = { createTestUsers };
