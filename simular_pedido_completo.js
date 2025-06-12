/**
 * 🎯 SIMULADOR COMPLETO DE PEDIDO - MELHOR ENVIO SANDBOX
 * 
 * Este script simula um pedido completo:
 * 1. Calcular frete ✅
 * 2. Gerar etiqueta (gasta créditos) 💰
 * 3. Ver status do pedido 📦
 */

require('dotenv').config({ path: '.env.local' });

const MELHOR_ENVIO_CONFIG = {
  apiUrl: 'https://sandbox.melhorenvio.com.br/api/v2',
  token: process.env.MELHOR_ENVIO_TOKEN
};

console.log('🧪 SIMULADOR DE PEDIDO COMPLETO - SANDBOX');
console.log('=' .repeat(50));

// Dados do pedido simulado
const PEDIDO_TESTE = {
  from: {
    name: 'RÜGE Store',
    phone: '11999887766',
    email: 'loja@ruge.com.br',
    document: '12345678901',
    company_document: '12345678000199',
    postal_code: '01310100',
    address: 'Avenida Paulista',
    number: '1000',
    complement: 'Loja 1',
    district: 'Bela Vista',
    city: 'São Paulo',
    state_abbr: 'SP',
    country_id: 'BR'
  },
  to: {
    name: 'João Cliente',
    phone: '21988776655',
    email: 'joao@cliente.com.br',
    document: '98765432100',
    postal_code: '20040020',
    address: 'Avenida Rio Branco',
    number: '100',
    complement: 'Apto 502',
    district: 'Centro',
    city: 'Rio de Janeiro',
    state_abbr: 'RJ',
    country_id: 'BR'
  },
  products: [
    {
      name: 'Camiseta Vintage RÜGE',
      quantity: 1,
      unitary_value: 89.90,
      weight: 0.3, // 300g
      width: 25,
      height: 2,
      length: 35,
      insurance_value: 89.90
    }
  ],
  volumes: [
    {
      height: 10,
      width: 25,
      length: 35,
      weight: 0.3
    }
  ],
  options: {
    insurance_value: 89.90,
    receipt: false,
    own_hand: false,
    reverse: false,
    non_commercial: false,
    invoice: {
      key: '12345678901234567890123456789012345678901234'
    },
    platform: 'RÜGE E-commerce'
  }
};

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
      console.log(`💵 Saldo atual: R$ ${balance.balance || '0,00'}`);
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

async function calcularFrete() {
  console.log('\n📦 1. Calculando opções de frete...');
  
  const requestData = {
    from: PEDIDO_TESTE.from,
    to: PEDIDO_TESTE.to,
    products: PEDIDO_TESTE.products.map(p => ({
      id: p.name,
      width: p.width,
      height: p.height,
      length: p.length,
      weight: p.weight,
      insurance_value: p.insurance_value,
      quantity: p.quantity
    })),
    options: {
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      insurance_value: PEDIDO_TESTE.options.insurance_value,
      services: '1,2,17,18,3,4' // Correios e Jadlog no sandbox
    }
  };

  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'User-Agent': 'RÜGE Store (teste@ruge.com.br)'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${await response.text()}`);
    }

    const opcoes = await response.json();
    
    console.log('✅ Opções encontradas:');
    const opcoesArray = Object.values(opcoes);
    
    opcoesArray.forEach((opcao, index) => {
      console.log(`${index + 1}. ${opcao.name}`);
      console.log(`   💰 R$ ${opcao.price}`);
      console.log(`   ⏱️  ${opcao.delivery_time} dias`);
      console.log(`   🚚 ${opcao.company?.name}`);
    });

    // Retorna a opção mais barata para o teste
    const maisBarata = opcoesArray.reduce((prev, current) => 
      parseFloat(prev.price) < parseFloat(current.price) ? prev : current
    );
    
    console.log(`\n🎯 Selecionada para o teste: ${maisBarata.name} - R$ ${maisBarata.price}`);
    return maisBarata;
    
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error.message);
    return null;
  }
}

async function gerarEtiqueta(opcaoFrete) {
  console.log('\n🏷️  2. Gerando etiqueta (isso vai gastar créditos!)...');
  
  const etiquetaData = {
    service: opcaoFrete.id,
    from: PEDIDO_TESTE.from,
    to: PEDIDO_TESTE.to,
    products: PEDIDO_TESTE.products,
    volumes: PEDIDO_TESTE.volumes,
    options: PEDIDO_TESTE.options
  };

  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'User-Agent': 'RÜGE Store (teste@ruge.com.br)'
      },
      body: JSON.stringify(etiquetaData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao gerar etiqueta:', response.status, errorText);
      return null;
    }

    const etiqueta = await response.json();
    console.log('✅ Etiqueta criada!');
    console.log(`📝 ID da Etiqueta: ${etiqueta.id}`);
    console.log(`💰 Valor: R$ ${etiqueta.price}`);
    console.log(`📦 Status: ${etiqueta.status}`);
    
    return etiqueta;
    
  } catch (error) {
    console.error('❌ Erro ao gerar etiqueta:', error.message);
    return null;
  }
}

async function comprarEtiqueta(etiquetaId) {
  console.log('\n💳 3. Comprando etiqueta (gastando créditos do sandbox)...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/shipment/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`
      },
      body: JSON.stringify({
        orders: [etiquetaId]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao comprar etiqueta:', response.status, errorText);
      return false;
    }

    const resultado = await response.json();
    console.log('✅ Etiqueta comprada com sucesso!');
    console.log(`💰 Créditos utilizados!`);
    console.log('📦 Status: Pronto para impressão');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao comprar etiqueta:', error.message);
    return false;
  }
}

async function listarPedidos() {
  console.log('\n📋 4. Listando seus pedidos no sandbox...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/orders?limit=5`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const pedidos = await response.json();
      
      if (pedidos.data && pedidos.data.length > 0) {
        console.log('📦 Seus pedidos recentes:');
        pedidos.data.forEach((pedido, index) => {
          console.log(`${index + 1}. ID: ${pedido.id}`);
          console.log(`   Status: ${pedido.status}`);
          console.log(`   Preço: R$ ${pedido.price}`);
          console.log(`   Para: ${pedido.to?.name || 'N/A'}`);
          console.log(`   Cidade: ${pedido.to?.city || 'N/A'}`);
        });
      } else {
        console.log('📭 Nenhum pedido encontrado ainda');
      }
    }
  } catch (error) {
    console.log('❌ Erro ao listar pedidos:', error.message);
  }
}

async function simularPedidoCompleto() {
  console.log('🚀 Iniciando simulação de pedido completo...\n');
  
  // Verificar saldo inicial
  const saldoInicial = await verificarSaldo();
  
  if (saldoInicial === 0) {
    console.log('❌ Sem saldo no sandbox! Verifique seu token.');
    return;
  }
  
  // 1. Calcular frete
  const opcaoFrete = await calcularFrete();
  if (!opcaoFrete) return;
  
  // 2. Gerar etiqueta
  const etiqueta = await gerarEtiqueta(opcaoFrete);
  if (!etiqueta) return;
  
  // 3. Comprar etiqueta (gasta créditos)
  const compraOk = await comprarEtiqueta(etiqueta.id);
  if (!compraOk) return;
  
  // 4. Verificar saldo final
  console.log('\n💰 Verificando saldo após a compra...');
  await verificarSaldo();
  
  // 5. Listar pedidos
  await listarPedidos();
  
  console.log('\n🎉 SIMULAÇÃO COMPLETA!');
  console.log('✅ Você acabou de simular um pedido real no sandbox');
  console.log('💰 Créditos fictícios foram utilizados');
  console.log('📦 No sandbox, o status será atualizado automaticamente após 15 min');
}

// Executar simulação
simularPedidoCompleto().catch(console.error);
