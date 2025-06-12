/**
 * 🏷️ GERADOR DE ETIQUETA SIMPLES - GASTA CRÉDITOS FICTÍCIOS
 * 
 * Este script vai realmente gastar seus R$ 10.000,00 fictícios!
 */

require('dotenv').config({ path: '.env.local' });

const MELHOR_ENVIO_CONFIG = {
  apiUrl: 'https://sandbox.melhorenvio.com.br/api/v2',
  token: process.env.MELHOR_ENVIO_TOKEN
};

console.log('🏷️ GERADOR DE ETIQUETA - VAI GASTAR CRÉDITOS!');
console.log('=' .repeat(50));

// Dados válidos para gerar etiqueta real
const dadosEtiqueta = {
  service: 3, // Jadlog .Package (mais barato)
  from: {
    name: 'RUGE Store',
    phone: '11999887766',
    email: 'loja@ruge.com.br',
    document: '11144477735', // CPF válido para teste
    postal_code: '01310100',
    address: 'Avenida Paulista',
    number: '1000',
    district: 'Bela Vista',
    city: 'São Paulo',
    state_abbr: 'SP',
    country_id: 'BR'
  },
  to: {
    name: 'João Cliente Silva',
    phone: '21988776655',
    email: 'joao@cliente.com.br',
    document: '22255588899', // CPF válido para teste
    postal_code: '20040020',
    address: 'Avenida Rio Branco',
    number: '100',
    district: 'Centro',
    city: 'Rio de Janeiro',
    state_abbr: 'RJ',
    country_id: 'BR'
  },
  products: [
    {
      name: 'Camiseta Vintage RUGE',
      quantity: 1,
      unitary_value: 50.00
    }
  ],
  volumes: [
    {
      height: 5,
      width: 20,
      length: 30,
      weight: 0.3
    }
  ],
  options: {
    insurance_value: 50.00,
    receipt: false,
    own_hand: false,
    reverse: false,
    non_commercial: false
  }
};

async function verificarSaldoAntes() {
  console.log('\n💰 Verificando saldo ANTES...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/balance`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const balance = await response.json();
      console.log(`💵 Saldo atual: R$ ${balance.balance}`);
      return parseFloat(balance.balance);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar saldo:', error.message);
  }
  return 0;
}

async function adicionarAoCarrinho() {
  console.log('\n🛒 1. Adicionando etiqueta ao carrinho...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'User-Agent': 'RUGE Store (teste@ruge.com.br)'
      },
      body: JSON.stringify(dadosEtiqueta)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao adicionar ao carrinho:', errorText);
      return null;
    }

    const etiqueta = await response.json();
    console.log('✅ Etiqueta adicionada ao carrinho!');
    console.log(`📝 ID: ${etiqueta.id}`);
    console.log(`💰 Preço: R$ ${etiqueta.price}`);
    console.log(`🚚 Serviço: ${etiqueta.service_name}`);
    console.log(`📦 Status: ${etiqueta.status}`);
    
    return etiqueta;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function comprarEtiqueta(etiquetaId) {
  console.log('\n💳 2. COMPRANDO ETIQUETA (gastando créditos!)...');
  console.log('⚠️  Esta ação vai descontar do seu saldo fictício!');
  
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
      console.error('❌ Erro ao comprar:', errorText);
      return false;
    }

    const resultado = await response.json();
    console.log('🎉 ETIQUETA COMPRADA COM SUCESSO!');
    console.log('💰 Créditos fictícios descontados!');
    console.log('📦 Status: Pago - Pronto para gerar');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao comprar:', error.message);
    return false;
  }
}

async function verificarSaldoDepois() {
  console.log('\n💰 Verificando saldo DEPOIS...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/balance`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const balance = await response.json();
      console.log(`💵 Novo saldo: R$ ${balance.balance}`);
      return parseFloat(balance.balance);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar saldo:', error.message);
  }
  return 0;
}

async function listarPedidosAtualizados() {
  console.log('\n📋 3. Verificando seus pedidos atualizados...');
  
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/orders?limit=3`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const pedidos = await response.json();
      
      if (pedidos.data && pedidos.data.length > 0) {
        console.log('📦 Seus pedidos mais recentes:');
        pedidos.data.forEach((pedido, index) => {
          console.log(`${index + 1}. ID: ${pedido.id}`);
          console.log(`   💰 Valor: R$ ${pedido.price}`);
          console.log(`   📦 Status: ${pedido.status}`);
          console.log(`   🚚 Serviço: ${pedido.service_name || 'N/A'}`);
          console.log(`   📍 Destino: ${pedido.to?.city}, ${pedido.to?.state_abbr}`);
          console.log('');
        });
      } else {
        console.log('📭 Nenhum pedido encontrado');
      }
    }
  } catch (error) {
    console.log('❌ Erro ao listar pedidos:', error.message);
  }
}

async function gerarEtiquetaCompleta() {
  console.log('🚀 INICIANDO GERAÇÃO DE ETIQUETA...');
  console.log('⚠️  ATENÇÃO: Isso vai gastar seus créditos fictícios!\n');
  
  // Verificar saldo inicial
  const saldoInicial = await verificarSaldoAntes();
  
  if (saldoInicial < 20) {
    console.log('❌ Saldo insuficiente! Você precisa de pelo menos R$ 20');
    return;
  }
  
  // 1. Adicionar ao carrinho
  const etiqueta = await adicionarAoCarrinho();
  if (!etiqueta) return;
  
  // 2. Comprar (gastar créditos)
  const compraOk = await comprarEtiqueta(etiqueta.id);
  if (!compraOk) return;
  
  // 3. Verificar saldo final
  const saldoFinal = await verificarSaldoDepois();
  const gastos = saldoInicial - saldoFinal;
  
  // 4. Listar pedidos atualizados
  await listarPedidosAtualizados();
  
  console.log('\n🎉 PROCESSO COMPLETO!');
  console.log('═'.repeat(30));
  console.log(`💰 Saldo inicial: R$ ${saldoInicial.toFixed(2)}`);
  console.log(`💰 Saldo final: R$ ${saldoFinal.toFixed(2)}`);
  console.log(`💸 Valor gasto: R$ ${gastos.toFixed(2)}`);
  console.log('🧪 Créditos fictícios utilizados com sucesso!');
  console.log('');
  console.log('📋 O que aconteceu:');
  console.log('✅ Etiqueta criada no sistema');
  console.log('✅ Créditos descontados');
  console.log('✅ Pedido registrado');
  console.log('⏱️  Em 15 min o status vai mudar automaticamente (sandbox)');
}

// Perguntar se quer mesmo gastar créditos
console.log('⚠️  CONFIRMAÇÃO:');
console.log('Este script vai realmente gastar seus créditos fictícios do sandbox!');
console.log('Pressione Ctrl+C para cancelar ou aguarde 3 segundos...\n');

setTimeout(() => {
  gerarEtiquetaCompleta().catch(console.error);
}, 3000);
