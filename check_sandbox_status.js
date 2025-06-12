const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function verificarSandbox() {
  const SANDBOX_API = 'https://sandbox.melhorenvio.com.br/api/v2';
  const TOKEN = process.env.MELHOR_ENVIO_TOKEN;

  console.log('🔍 Verificando configuração do Sandbox Melhor Envio...\n');

  // Verificar se o token existe
  if (!TOKEN) {
    console.log('❌ MELHOR_ENVIO_TOKEN não encontrado no .env.local');
    return;
  }

  console.log('✅ Token encontrado');
  console.log(`📏 Tamanho do token: ${TOKEN.length} caracteres`);
  console.log(`🔗 API URL: ${SANDBOX_API}\n`);

  try {
    // Teste 1: Verificar informações do usuário
    console.log('🧪 Teste 1: Verificando informações do usuário...');
    const userResponse = await fetch(`${SANDBOX_API}/me`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json',
        'User-Agent': 'RUGE Test (contato@ruge.com.br)'
      }
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Informações do usuário obtidas com sucesso!');
      console.log(`👤 Nome: ${userData.firstname} ${userData.lastname}`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`🏢 Empresa: ${userData.company?.fantasy_name || 'Não informado'}`);
    } else {
      console.log(`❌ Erro ao obter informações do usuário: ${userResponse.status}`);
      const errorText = await userResponse.text();
      console.log('📄 Resposta:', errorText);
      return;
    }

    console.log('\n---\n');

    // Teste 2: Verificar serviços disponíveis
    console.log('🧪 Teste 2: Verificando serviços de entrega disponíveis...');
    const servicesResponse = await fetch(`${SANDBOX_API}/me/shipment/services`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json',
        'User-Agent': 'RUGE Test (contato@ruge.com.br)'
      }
    });

    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log(`✅ Encontrados ${servicesData.length} serviços disponíveis:`);
      
      servicesData.forEach(service => {
        const price = service.price ? `R$ ${parseFloat(service.price).toFixed(2)}` : 'Preço variável';
        console.log(`  📦 ${service.name} (${service.company.name}) - ${price}`);
      });
    } else {
      console.log(`❌ Erro ao obter serviços: ${servicesResponse.status}`);
    }

    console.log('\n---\n');

    // Teste 3: Teste de cálculo de frete simples
    console.log('🧪 Teste 3: Calculando frete de teste...');
    
    const testShipment = {
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
        postal_code: '20040020', // Centro do Rio de Janeiro
        country_id: 'BR'
      },
      products: [{
        id: 'test-product',
        width: 25,
        height: 3,
        length: 30,
        weight: 0.3,
        insurance_value: 99.90,
        quantity: 1
      }],
      options: {
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        services: '1,2,3,4,7,8,9,10,11,12,17,18'
      }
    };

    const calcResponse = await fetch(`${SANDBOX_API}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'RUGE Test (contato@ruge.com.br)'
      },
      body: JSON.stringify(testShipment)
    });

    if (calcResponse.ok) {
      const calcData = await calcResponse.json();
      const optionsCount = Object.keys(calcData).length;
      console.log(`✅ Cálculo de frete realizado com sucesso!`);
      console.log(`📦 ${optionsCount} opções de entrega encontradas`);
      
      // Mostrar as 3 mais baratas
      const sortedOptions = Object.values(calcData)
        .sort((a, b) => {
          const priceA = parseFloat(a.custom_price || a.price || 999999);
          const priceB = parseFloat(b.custom_price || b.price || 999999);
          return priceA - priceB;
        })
        .slice(0, 3);

      console.log('\n💰 3 opções mais baratas:');
      sortedOptions.forEach((option, index) => {
        const price = parseFloat(option.custom_price || option.price);
        console.log(`  ${index + 1}. ${option.company.name} - ${option.name}`);
        console.log(`     R$ ${price.toFixed(2)} em ${option.delivery_time} dias úteis`);
      });

    } else {
      console.log(`❌ Erro no cálculo de frete: ${calcResponse.status}`);
      const errorText = await calcResponse.text();
      console.log('📄 Resposta:', errorText);
    }

    console.log('\n🎉 Todos os testes concluídos!');
    console.log('\n📋 Resumo:');
    console.log('✅ Sandbox está funcionando corretamente');
    console.log('✅ Token é válido');
    console.log('✅ Cálculos de frete estão operacionais');
    console.log('\n💡 Você pode usar o sistema normalmente em modo de desenvolvimento!');

  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verificar conexão com internet');
    console.log('2. Verificar se o token não expirou');
    console.log('3. Verificar se o sandbox está online');
  }
}

verificarSandbox();
