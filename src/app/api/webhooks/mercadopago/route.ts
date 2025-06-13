import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * Webhook do Mercado Pago
 * 
 * QUANDO FUNCIONA:
 * 1. Cliente paga no Mercado Pago
 * 2. Mercado Pago chama este webhook
 * 3. Verificamos se pagamento foi aprovado
 * 4. Se aprovado: geramos etiqueta automaticamente no Melhor Envio
 * 5. Salvamos pedido no banco (Supabase)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[WEBHOOK] Recebido do Mercado Pago:', body.type);

    // Só processar pagamentos
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    // Configurar Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });

    const payment = new Payment(client);
    
    // Buscar dados do pagamento
    const paymentData = await payment.get({ id: body.data.id });
    
    console.log(`[WEBHOOK] Pagamento ${paymentData.id} - Status: ${paymentData.status}`);

    // Só processar se aprovado
    if (paymentData.status !== 'approved') {
      console.log('[WEBHOOK] Pagamento não aprovado, ignorando...');
      return NextResponse.json({ received: true });
    }    // Extrair metadados do pedido
    const metadata = paymentData.metadata;
    if (!metadata) {
      console.error('[WEBHOOK] Sem metadados no pagamento');
      return NextResponse.json({ error: 'Sem metadados' }, { status: 400 });
    }

    const pedidoId = paymentData.external_reference;
    if (!pedidoId) {
      console.error('[WEBHOOK] Sem external_reference no pagamento');
      return NextResponse.json({ error: 'Sem referência do pedido' }, { status: 400 });
    }

    // Parse dos metadados que agora vêm como JSON strings
    const produtos = JSON.parse(metadata.items as string);
    const frete = JSON.parse(metadata.shipping_option as string);
    const enderecoEntrega = JSON.parse(metadata.shipping_address as string);
    const dadosCliente = JSON.parse(metadata.customer_info as string);

    console.log(`[WEBHOOK] Processando pedido ${pedidoId}`);
    console.log(`[WEBHOOK] Valor pago: R$ ${paymentData.transaction_amount}`);
    console.log(`[WEBHOOK] Frete escolhido: ${frete.nome} - R$ ${frete.preco}`);

    // 🚀 GERAR ETIQUETA AUTOMATICAMENTE
    const etiquetaResult = await gerarEtiquetaAutomatica(produtos, frete, enderecoEntrega, pedidoId);

    // 💾 SALVAR PEDIDO NO BANCO
    await salvarPedidoNoBanco({
      pedido_id: pedidoId,
      pagamento_id: paymentData.id,
      status: 'pago',
      produtos,
      frete,
      endereco_entrega: enderecoEntrega,
      valor_total: paymentData.transaction_amount,
      etiqueta: etiquetaResult
    });

    console.log(`[WEBHOOK] ✅ Pedido ${pedidoId} processado com sucesso!`);

    return NextResponse.json({ 
      success: true,
      pedido_id: pedidoId,
      etiqueta_gerada: etiquetaResult?.success || false
    });

  } catch (error) {
    console.error('[WEBHOOK] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * Gera etiqueta automaticamente no Melhor Envio
 */
async function gerarEtiquetaAutomatica(produtos: any[], frete: any, enderecoEntrega: any, pedidoId: string) {
  try {
    console.log('[ETIQUETA] Gerando etiqueta automaticamente...');

    const isSandbox = process.env.NODE_ENV === 'development' || process.env.MELHOR_ENVIO_SANDBOX === 'true';
    const melhorEnvioConfig = {
      apiUrl: isSandbox 
        ? 'https://sandbox.melhorenvio.com.br/api/v2' 
        : 'https://melhorenvio.com.br/api/v2',
      token: isSandbox 
        ? process.env.MELHOR_ENVIO_SANDBOX_TOKEN 
        : process.env.MELHOR_ENVIO_TOKEN
    };

    // Dados da etiqueta
    const etiquetaData = {
      service: frete.id,
      from: {
        name: 'RÜGE Store',
        phone: '11999887766',
        email: 'contato@ruge.com.br',
        document: '11144477735', // CPF da loja
        postal_code: '01310100', // CEP da loja
        address: 'Avenida Paulista',
        number: '1000',
        district: 'Bela Vista',
        city: 'São Paulo',
        state_abbr: 'SP',
        country_id: 'BR'
      },
      to: {
        name: enderecoEntrega.nome,
        phone: enderecoEntrega.telefone,
        email: enderecoEntrega.email,
        document: enderecoEntrega.cpf,
        postal_code: enderecoEntrega.cep,
        address: enderecoEntrega.endereco,
        number: enderecoEntrega.numero,
        complement: enderecoEntrega.complemento || '',
        district: enderecoEntrega.bairro,
        city: enderecoEntrega.cidade,
        state_abbr: enderecoEntrega.estado,
        country_id: 'BR'
      },
      products: produtos.map(p => ({
        name: p.nome,
        quantity: p.quantidade,
        unitary_value: p.preco
      })),
      volumes: [
        {
          height: 10,
          width: 30,
          length: 40,
          weight: produtos.reduce((sum, p) => sum + (p.peso || 0.5) * p.quantidade, 0)
        }
      ],
      options: {
        insurance_value: produtos.reduce((sum, p) => sum + p.preco * p.quantidade, 0),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false
      }
    };

    // 1. Adicionar ao carrinho
    const carrinhoResponse = await fetch(`${melhorEnvioConfig.apiUrl}/me/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${melhorEnvioConfig.token}`,
        'User-Agent': 'RUGE Store'
      },
      body: JSON.stringify(etiquetaData)
    });

    if (!carrinhoResponse.ok) {
      const error = await carrinhoResponse.text();
      console.error('[ETIQUETA] Erro ao adicionar ao carrinho:', error);
      return { success: false, error };
    }

    const etiqueta = await carrinhoResponse.json();
    console.log(`[ETIQUETA] Adicionada ao carrinho: ${etiqueta.id}`);

    // 2. Comprar etiqueta (gastar créditos)
    const compraResponse = await fetch(`${melhorEnvioConfig.apiUrl}/me/shipment/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${melhorEnvioConfig.token}`
      },
      body: JSON.stringify({
        orders: [etiqueta.id]
      })
    });

    if (!compraResponse.ok) {
      const error = await compraResponse.text();
      console.error('[ETIQUETA] Erro ao comprar:', error);
      return { success: false, error };
    }

    console.log(`[ETIQUETA] ✅ Etiqueta comprada com sucesso! ID: ${etiqueta.id}`);
    
    return {
      success: true,
      etiqueta_id: etiqueta.id,
      valor: etiqueta.price,
      servico: frete.nome
    };
  } catch (error) {
    console.error('[ETIQUETA] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: errorMessage };
  }
}

/**
 * Salva pedido no banco de dados (Supabase)
 */
async function salvarPedidoNoBanco(dadosPedido: any) {
  try {
    console.log('[BANCO] Salvando pedido no Supabase...');
    
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Atualizar o pedido existente com dados do pagamento
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_id: dadosPedido.pagamento_id,
        shipping_status: dadosPedido.etiqueta?.success ? 'label_generated' : 'pending',
        label_id: dadosPedido.etiqueta?.etiqueta_id,
        updated_at: new Date().toISOString()
      })
      .eq('preference_id', dadosPedido.pedido_id)
      .select()
      .single();

    if (error) {
      console.error('[BANCO] Erro ao atualizar pedido:', error);
      return { success: false, error: error.message };
    }

    console.log('[BANCO] ✅ Pedido atualizado com sucesso:', data?.id);
    return { success: true, data };
    
  } catch (error) {
    console.error('[BANCO] Erro ao salvar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: errorMessage };
  }
}
