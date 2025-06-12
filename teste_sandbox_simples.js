/**
 * 🎯 SIMULADOR SIMPLIFICADO - MELHOR ENVIO SANDBOX
 * 
 * Versão corrigida com dados válidos
 */

require('dotenv').config({ path: '.env.local' });

const MELHOR_ENVIO_CONFIG = {
  apiUrl: 'https://sandbox.melhorenvio.com.br/api/v2',
  token: process.env.MELHOR_ENVIO_TOKEN
};

console.log('🧪 SIMULADOR SIMPLIFICADO - SANDBOX');
console.log('=' .repeat(40));

async function verificarSaldo() {
  console.log('\n💰 Verificando saldo...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/balance`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const balance = await response.json();
      console.log(`💵 Saldo disponível: R$ ${balance.balance || '0,00'}`);
      console.log('🧪 Este é dinheiro fictício do sandbox para testes!');
      return balance.balance || 0;
    } else {
      console.log('❌ Não foi possível verificar o saldo');
      return 0;
    }
  } catch (error) {
    console.log('❌ Erro ao verificar saldo:', error.message);
    return 0;
  }
}

async function listarPedidosExistentes() {
  console.log('\n📋 Verificando pedidos existentes...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/orders?limit=10`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const pedidos = await response.json();
      
      if (pedidos.data && pedidos.data.length > 0) {
        console.log(`📦 Você tem ${pedidos.data.length} pedidos no sandbox:`);
        pedidos.data.forEach((pedido, index) => {
          console.log(`${index + 1}. ID: ${pedido.id}`);
          console.log(`   Status: ${pedido.status}`);
          console.log(`   Preço: R$ ${pedido.price}`);
          console.log(`   Serviço: ${pedido.service_name || 'N/A'}`);
          console.log(`   Para: ${pedido.to?.city || 'N/A'}, ${pedido.to?.state_abbr || 'N/A'}`);
          console.log('');
        });
        
        console.log('🧪 LEMBRE-SE: No sandbox, os status mudam automaticamente após 15 minutos!');
        return pedidos.data;
      } else {
        console.log('📭 Nenhum pedido encontrado');
        console.log('💡 Você pode criar pedidos via painel do sandbox ou API');
        return [];
      }
    }
  } catch (error) {
    console.log('❌ Erro ao listar pedidos:', error.message);
    return [];
  }
}

async function calcularFreteSimples() {
  console.log('\n📦 Calculando frete São Paulo → Rio de Janeiro...');
  
  const requestData = {
    from: {
      postal_code: '01310100'
    },
    to: {
      postal_code: '20040020'
    },
    products: [
      {
        id: '1',
        width: 20,
        height: 5,
        length: 30,
        weight: 0.5,
        insurance_value: 50.00,
        quantity: 1
      }
    ],
    options: {
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      insurance_value: 50.00,
      services: '1,2,3,4' // Correios PAC, SEDEX e Jadlog
    }
  };

  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'User-Agent': 'RÜGE Store Teste'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${await response.text()}`);
    }

    const opcoes = await response.json();
    
    console.log('✅ Opções de frete encontradas:');
    Object.values(opcoes).forEach((opcao, index) => {
      console.log(`${index + 1}. ${opcao.name}`);
      console.log(`   💰 R$ ${opcao.price}`);
      console.log(`   ⏱️  ${opcao.delivery_time} dias úteis`);
      console.log(`   🚚 ${opcao.company?.name}`);
      console.log('');
    });

    return Object.values(opcoes);
    
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error.message);
    return [];
  }
}

async function verificarInfoConta() {
  console.log('\n👤 Verificando informações da conta...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Conta autenticada:');
      console.log(`📧 Email: ${userData.email || 'N/A'}`);
      console.log(`👤 Nome: ${userData.firstname || 'N/A'} ${userData.lastname || ''}`);
      console.log(`🏢 Empresa: ${userData.company?.name || 'N/A'}`);
      console.log('🧪 Ambiente: SANDBOX (Testes)');
    } else {
      console.log('❌ Não foi possível obter informações da conta');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar conta:', error.message);
  }
}

async function mostrarResumoSandbox() {
  console.log('\n🧪 RESUMO DO SANDBOX:');
  console.log('═'.repeat(40));
  console.log('✅ O que você PODE fazer:');
  console.log('   • Calcular fretes (grátis)');
  console.log('   • Gerar etiquetas (gasta créditos fictícios)');
  console.log('   • Testar integrações');
  console.log('   • Simular todo o fluxo de envio');
  console.log('');
  console.log('💰 Saldo fictício: R$ 10.000,00');
  console.log('🚚 Transportadoras: Apenas Correios e Jadlog');
  console.log('⏱️  Status: Mudanças automáticas após 15 min');
  console.log('');
  console.log('❌ O que você NÃO pode fazer:');
  console.log('   • Envios reais');
  console.log('   • Usar outras transportadoras');
  console.log('   • Cobrar clientes reais');
  console.log('');
  console.log('🔄 Para criar pedidos reais:');
  console.log('   1. Crie conta em melhorenvio.com.br (produção)');
  console.log('   2. Obtenha token de produção');
  console.log('   3. Configure NODE_ENV=production');
  console.log('   4. Adicione saldo real na conta');
}

async function executarTestes() {
  console.log('🚀 Executando testes do sandbox...\n');
  
  // 1. Verificar conta
  await verificarInfoConta();
  
  // 2. Verificar saldo
  const saldo = await verificarSaldo();
  
  // 3. Calcular frete
  const opcoes = await calcularFreteSimples();
  
  // 4. Listar pedidos existentes
  const pedidos = await listarPedidosExistentes();
  
  // 5. Mostrar resumo
  await mostrarResumoSandbox();
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Para gerar etiquetas reais, use o painel: https://sandbox.melhorenvio.com.br/');
  console.log('2. Para integrar com sua loja, use a API que já implementamos');
  console.log('3. Para produção, configure o token real e NODE_ENV=production');
  
  return {
    saldo,
    opcoesFrete: opcoes.length,
    pedidosExistentes: pedidos.length
  };
}

// Executar testes
executarTestes()
  .then(resultado => {
    console.log('\n✅ TESTES CONCLUÍDOS!');
    console.log(`💰 Saldo: R$ ${resultado.saldo}`);
    console.log(`📦 Opções de frete: ${resultado.opcoesFrete}`);
    console.log(`📋 Pedidos existentes: ${resultado.pedidosExistentes}`);
  })
  .catch(console.error);
