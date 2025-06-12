/**
 * 🏷️ GERADOR DE ETIQUETA COM CPFs VÁLIDOS - SANDBOX
 * 
 * Este vai funcionar e gastar seus créditos fictícios!
 */

require('dotenv').config({ path: '.env.local' });

const MELHOR_ENVIO_CONFIG = {
  apiUrl: 'https://sandbox.melhorenvio.com.br/api/v2',
  token: process.env.MELHOR_ENVIO_TOKEN
};

console.log('🏷️ GERADOR DE ETIQUETA (VERSÃO CORRIGIDA)');
console.log('=' .repeat(50));

// Dados com CPFs válidos para teste
const dadosEtiqueta = {
  service: 3, // Jadlog .Package
  from: {
    name: 'RUGE Store',
    phone: '11999887766',
    email: 'loja@ruge.com.br',
    document: '11144477735', // CPF válido
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
    document: '12345678909', // CPF válido para teste
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

async function verificarSaldo() {
  try {
    const response = await fetch(`${MELHOR_ENVIO_CONFIG.apiUrl}/me/balance`, {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_CONFIG.token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const balance = await response.json();
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
      console.error('❌ Erro:', errorText);
      return null;
    }

    const etiqueta = await response.json();
    console.log('✅ Etiqueta adicionada ao carrinho!');
    console.log(`📝 ID: ${etiqueta.id}`);
    console.log(`💰 Preço: R$ ${etiqueta.price}`);
    console.log(`🚚 Serviço: ${etiqueta.service_name}`);
    
    return etiqueta;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
}

async function comprarEtiqueta(etiquetaId) {
  console.log('\n💳 2. COMPRANDO ETIQUETA (gastando créditos!)...');
  
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

    console.log('🎉 ETIQUETA COMPRADA COM SUCESSO!');
    console.log('💰 Créditos fictícios descontados!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

async function gerarEtiquetaCompleta() {
  console.log('🚀 INICIANDO GERAÇÃO DE ETIQUETA...\n');
  
  // Saldo antes
  console.log('💰 Verificando saldo ANTES...');
  const saldoAntes = await verificarSaldo();
  console.log(`💵 Saldo atual: R$ ${saldoAntes}`);
  
  if (saldoAntes < 20) {
    console.log('❌ Saldo insuficiente!');
    return;
  }
  
  // 1. Adicionar ao carrinho
  const etiqueta = await adicionarAoCarrinho();
  if (!etiqueta) return;
  
  // 2. Comprar (gastar créditos)
  const compraOk = await comprarEtiqueta(etiqueta.id);
  if (!compraOk) return;
  
  // Saldo depois
  console.log('\n💰 Verificando saldo DEPOIS...');
  const saldoDepois = await verificarSaldo();
  console.log(`💵 Novo saldo: R$ ${saldoDepois}`);
  
  const gastos = saldoAntes - saldoDepois;
  
  console.log('\n🎉 SUCESSO! CRÉDITOS GASTOS!');
  console.log('═'.repeat(40));
  console.log(`💰 Saldo inicial: R$ ${saldoAntes.toFixed(2)}`);
  console.log(`💰 Saldo final: R$ ${saldoDepois.toFixed(2)}`);
  console.log(`💸 VALOR GASTO: R$ ${gastos.toFixed(2)}`);
  console.log('');
  console.log('✅ Você acabou de simular um pedido real!');
  console.log('🧪 Créditos fictícios foram utilizados');
  console.log('⏱️  Status vai mudar automaticamente em 15 min');
  
  // Verificar pedidos
  console.log('\n📋 Verificando seus pedidos...');
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
        console.log('📦 Seu pedido mais recente:');
        const ultimo = pedidos.data[0];
        console.log(`   ID: ${ultimo.id}`);
        console.log(`   Status: ${ultimo.status}`);
        console.log(`   Valor: R$ ${ultimo.price}`);
        console.log(`   Destino: ${ultimo.to?.city}, ${ultimo.to?.state_abbr}`);
      }
    }
  } catch (error) {
    console.log('Pedidos: erro ao listar');
  }
}

console.log('⚠️  Este script vai gastar seus créditos fictícios!');
console.log('Aguardando 2 segundos...\n');

setTimeout(() => {
  gerarEtiquetaCompleta().catch(console.error);
}, 2000);
