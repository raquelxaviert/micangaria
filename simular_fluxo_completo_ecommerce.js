/**
 * 🧪 SIMULADOR DO FLUXO COMPLETO
 * 
 * Simula desde o cálculo de frete até a geração automática da etiqueta
 */

require('dotenv').config({ path: '.env.local' });

console.log('🛒 SIMULADOR FLUXO COMPLETO E-COMMERCE');
console.log('=' .repeat(50));

// Dados do pedido simulado
const PEDIDO_EXEMPLO = {
  produtos: [
    {
      id: '1',
      name: 'Camiseta Vintage RÜGE',
      price: 89.90,
      quantity: 1,
      weight: 0.3,
      width: 25,
      height: 2,
      length: 35
    },
    {
      id: '2', 
      name: 'Calça Jeans Vintage',
      price: 120.00,
      quantity: 1,
      weight: 0.8,
      width: 30,
      height: 3,
      length: 40
    }
  ],
  enderecoEntrega: {
    cep: '20040020',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    nome: 'João Cliente',
    telefone: '21999887766',
    email: 'joao@cliente.com.br',
    cpf: '12345678909',
    endereco: 'Avenida Rio Branco',
    numero: '100',
    bairro: 'Centro'
  }
};

async function step1_calcularFrete() {
  console.log('\n🚚 PASSO 1: Cliente calculando frete...');
  
  const subtotalProdutos = PEDIDO_EXEMPLO.produtos.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  console.log(`💰 Subtotal dos produtos: R$ ${subtotalProdutos.toFixed(2)}`);
  
  const requestData = {
    from: {
      postal_code: '01310100', // CEP da sua loja
      address: 'Avenida Paulista', 
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state_abbr: 'SP'
    },
    to: {
      postal_code: PEDIDO_EXEMPLO.enderecoEntrega.cep,
      city: PEDIDO_EXEMPLO.enderecoEntrega.cidade,
      state_abbr: PEDIDO_EXEMPLO.enderecoEntrega.estado
    },
    products: PEDIDO_EXEMPLO.produtos.map(p => ({
      id: p.id,
      width: p.width,
      height: p.height,
      length: p.length,
      weight: p.weight,
      insurance_value: p.price,
      quantity: p.quantity,
      unitary_value: p.price
    }))
  };

  try {
    // Simular chamada para sua API
    console.log('📡 Chamando /api/shipping/calculate...');
    
    const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        'User-Agent': 'RUGE Store Simulacao'
      },
      body: JSON.stringify({
        ...requestData,
        options: {
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false,
          insurance_value: subtotalProdutos,
          services: '1,2,3,4' // Correios e Jadlog
        }
      })
    });

    const freteOptions = await response.json();
    
    console.log('✅ Opções de frete encontradas:');
    const opcoes = Object.values(freteOptions);
    opcoes.forEach((opcao, index) => {
      console.log(`${index + 1}. ${opcao.name} - R$ ${opcao.price} (${opcao.delivery_time} dias)`);
    });

    // Cliente escolhe a mais barata
    const maisBarata = opcoes.reduce((prev, current) => 
      parseFloat(prev.price) < parseFloat(current.price) ? prev : current
    );
    
    console.log(`\n🎯 Cliente escolheu: ${maisBarata.name} - R$ ${maisBarata.price}`);
    
    const totalPedido = subtotalProdutos + parseFloat(maisBarata.price);
    console.log(`💰 TOTAL DO PEDIDO: R$ ${totalPedido.toFixed(2)}`);
    
    return {
      subtotalProdutos,
      freteEscolhido: maisBarata,
      totalPedido
    };
    
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error.message);
    return null;
  }
}

async function step2_simularPagamento(dadosPedido) {
  console.log('\n💳 PASSO 2: Cliente pagando via Mercado Pago...');
  
  console.log('🔄 Criando preferência de pagamento...');
  console.log(`💰 Valor total: R$ ${dadosPedido.totalPedido.toFixed(2)}`);
  
  // Simular estrutura de dados que seria enviada para o MP
  const preferenciaData = {
    items: [
      // Produtos
      ...PEDIDO_EXEMPLO.produtos.map(produto => ({
        title: produto.name,
        quantity: produto.quantity,
        unit_price: produto.price,
        currency_id: 'BRL'
      })),
      // Frete
      {
        title: `Frete - ${dadosPedido.freteEscolhido.name}`,
        quantity: 1,
        unit_price: parseFloat(dadosPedido.freteEscolhido.price),
        currency_id: 'BRL'
      }
    ],
    metadata: {
      shipping_service_id: dadosPedido.freteEscolhido.id,
      shipping_service_name: dadosPedido.freteEscolhido.name,
      shipping_price: dadosPedido.freteEscolhido.price,
      delivery_address: PEDIDO_EXEMPLO.enderecoEntrega,
      products: PEDIDO_EXEMPLO.produtos
    }
  };

  console.log('✅ Preferência criada (simulação)');
  console.log('🔗 Cliente redirecionado para Mercado Pago');
  console.log('💳 Cliente paga com PIX/cartão...');
  console.log('✅ PAGAMENTO APROVADO!');
  
  // Simular ID de pagamento
  const paymentId = `PAY_${Date.now()}`;
  console.log(`📝 Payment ID: ${paymentId}`);
  
  return {
    paymentId,
    paymentAmount: dadosPedido.totalPedido,
    metadata: preferenciaData.metadata
  };
}

async function step3_webhookProcessamento(pagamentoData) {
  console.log('\n🔔 PASSO 3: Webhook processando pagamento aprovado...');
  
  console.log(`💰 Pagamento recebido: R$ ${pagamentoData.paymentAmount.toFixed(2)}`);
  
  // Calcular taxas do Mercado Pago (aproximadamente 4%)
  const taxaMP = pagamentoData.paymentAmount * 0.04;
  const valorLiquido = pagamentoData.paymentAmount - taxaMP;
  
  console.log(`💸 Taxa Mercado Pago (~4%): R$ ${taxaMP.toFixed(2)}`);
  console.log(`💰 Valor líquido recebido: R$ ${valorLiquido.toFixed(2)}`);
  
  // Simular geração de etiqueta
  console.log('\n📦 Gerando etiqueta automaticamente no Melhor Envio...');
  
  const custoFrete = parseFloat(pagamentoData.metadata.shipping_price);
  console.log(`💸 Gastando R$ ${custoFrete.toFixed(2)} para gerar etiqueta...`);
  
  // Simular sucesso na geração
  const trackingCode = `BR${Date.now()}BR`;
  console.log(`✅ Etiqueta gerada com sucesso!`);
  console.log(`📋 Código de rastreamento: ${trackingCode}`);
  
  console.log('\n💾 Salvando pedido no banco de dados...');
  console.log('📧 Enviando email de confirmação para cliente...');
  
  return {
    trackingCode,
    custoFrete,
    valorLiquido
  };
}

async function step4_resultadoFinal(dadosPedido, resultadoProcessamento) {
  console.log('\n🎉 PASSO 4: RESULTADO FINAL');
  console.log('=' .repeat(50));
  
  const { subtotalProdutos, totalPedido } = dadosPedido;
  const { custoFrete, valorLiquido } = resultadoProcessamento;
  
  const lucroFinal = valorLiquido - custoFrete;
  
  console.log('📊 RESUMO FINANCEIRO:');
  console.log(`💰 Cliente pagou: R$ ${totalPedido.toFixed(2)}`);
  console.log(`💰 Você recebeu (líquido): R$ ${valorLiquido.toFixed(2)}`);
  console.log(`💸 Você gastou (frete): R$ ${custoFrete.toFixed(2)}`);
  console.log(`🎯 SEU LUCRO FINAL: R$ ${lucroFinal.toFixed(2)}`);
  
  const margemLucro = (lucroFinal / totalPedido) * 100;
  console.log(`📈 Margem de lucro: ${margemLucro.toFixed(1)}%`);
  
  console.log('\n✅ PROCESSOS CONCLUÍDOS:');
  console.log('• ✅ Frete calculado automaticamente');
  console.log('• ✅ Cliente pagou o valor total');
  console.log('• ✅ Etiqueta gerada automaticamente'); 
  console.log('• ✅ Email enviado com rastreamento');
  console.log('• ✅ Pedido salvo no sistema');
  
  console.log('\n📦 PRÓXIMOS PASSOS MANUAIS:');
  console.log('• 📦 Embalar produtos');
  console.log('• 🖨️  Imprimir etiqueta');
  console.log('• 📮 Levar aos Correios/Jadlog');
  console.log('• 😊 Cliente recebe em casa!');
}

async function simularFluxoCompleto() {
  console.log('🚀 Iniciando simulação do fluxo completo...\n');
  
  try {
    // Passo 1: Calcular frete
    const dadosPedido = await step1_calcularFrete();
    if (!dadosPedido) return;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Passo 2: Pagamento
    const pagamentoData = await step2_simularPagamento(dadosPedido);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Passo 3: Webhook e processamento
    const resultadoProcessamento = await step3_webhookProcessamento(pagamentoData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Passo 4: Resultado final
    await step4_resultadoFinal(dadosPedido, resultadoProcessamento);
    
    console.log('\n🎊 SIMULAÇÃO COMPLETA!');
    console.log('Este é exatamente como funcionará na sua loja real!');
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error);
  }
}

// Executar simulação
simularFluxoCompleto();
