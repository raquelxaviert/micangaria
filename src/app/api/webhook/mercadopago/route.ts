/**
 * 🔄 WEBHOOK MERCADO PAGO + GERAÇÃO AUTOMÁTICA DE ETIQUETA
 * 
 * Este endpoint:
 * 1. Recebe notificação de pagamento aprovado
 * 2. Gera etiqueta automaticamente no Melhor Envio
 * 3. Salva pedido no banco
 * 4. Envia email para cliente
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar se é notificação de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Tipo de notificação ignorado' });
    }

    const paymentId = body.data.id;
    
    // Buscar detalhes do pagamento no Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    const payment = await paymentResponse.json();
    
    // Verificar se pagamento foi aprovado
    if (payment.status !== 'approved') {
      console.log(`Pagamento ${paymentId} não aprovado: ${payment.status}`);
      return NextResponse.json({ message: 'Pagamento não aprovado' });
    }

    console.log(`💰 Pagamento aprovado: ${paymentId} - R$ ${payment.transaction_amount}`);

    // Extrair dados do frete dos metadados
    const metadata = payment.metadata;
    const {
      shipping_service_id,
      shipping_service_name, 
      shipping_price,
      delivery_address,
      products
    } = metadata;

    // Gerar etiqueta automaticamente no Melhor Envio
    const etiquetaResult = await gerarEtiquetaAutomatica({
      serviceId: shipping_service_id,
      endereco: delivery_address,
      produtos: products,
      paymentId: paymentId
    });

    if (etiquetaResult.success) {
      console.log(`📦 Etiqueta gerada: ${etiquetaResult.trackingCode}`);
      
      // Salvar pedido no banco de dados
      await salvarPedidoNoBanco({
        paymentId,
        payment,
        etiquetaId: etiquetaResult.etiquetaId,
        trackingCode: etiquetaResult.trackingCode,
        shippingPrice: shipping_price,
        products,
        delivery_address
      });

      // Enviar email para cliente com código de rastreamento
      await enviarEmailConfirmacao({
        email: payment.payer.email,
        trackingCode: etiquetaResult.trackingCode,
        products,
        totalPago: payment.transaction_amount
      });

      return NextResponse.json({
        message: 'Pedido processado com sucesso',
        trackingCode: etiquetaResult.trackingCode
      });
    } else {
      console.error('❌ Erro ao gerar etiqueta:', etiquetaResult.error);
      
      // Mesmo com erro na etiqueta, salvar pedido para processar manualmente
      await salvarPedidoNoBanco({
        paymentId,
        payment,
        etiquetaId: null,
        trackingCode: null,
        shippingPrice: shipping_price,
        products,
        delivery_address,
        status: 'pending_shipping' // Para processar manualmente
      });

      return NextResponse.json({
        message: 'Pagamento processado, etiqueta será gerada manualmente',
        error: etiquetaResult.error
      });
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json(
      { message: 'Erro interno', error: error.message },
      { status: 500 }
    );
  }
}

async function gerarEtiquetaAutomatica({ serviceId, endereco, produtos, paymentId }) {
  try {
    const melhorEnvioConfig = {
      apiUrl: process.env.NODE_ENV === 'development' 
        ? 'https://sandbox.melhorenvio.com.br/api/v2'
        : 'https://melhorenvio.com.br/api/v2',
      token: process.env.NODE_ENV === 'development'
        ? process.env.MELHOR_ENVIO_SANDBOX_TOKEN
        : process.env.MELHOR_ENVIO_TOKEN
    };

    // Dados para gerar etiqueta
    const etiquetaData = {
      service: serviceId,
      from: {
        name: 'RÜGE Store',
        phone: '11999887766',
        email: 'loja@ruge.com.br',
        document: '11144477735', // Seu CPF
        postal_code: '01310100', // SEU CEP
        address: 'Avenida Paulista',
        number: '1000',
        district: 'Bela Vista',
        city: 'São Paulo',
        state_abbr: 'SP',
        country_id: 'BR'
      },
      to: {
        name: endereco.nome,
        phone: endereco.telefone,
        email: endereco.email,
        document: endereco.cpf,
        postal_code: endereco.cep,
        address: endereco.endereco,
        number: endereco.numero,
        complement: endereco.complemento || '',
        district: endereco.bairro,
        city: endereco.cidade,
        state_abbr: endereco.estado,
        country_id: 'BR'
      },
      products: produtos.map(p => ({
        name: p.name,
        quantity: p.quantity,
        unitary_value: p.price
      })),
      volumes: [{
        height: Math.max(...produtos.map(p => p.height)),
        width: Math.max(...produtos.map(p => p.width)),
        length: Math.max(...produtos.map(p => p.length)),
        weight: produtos.reduce((sum, p) => sum + (p.weight * p.quantity), 0)
      }],
      options: {
        insurance_value: produtos.reduce((sum, p) => sum + (p.price * p.quantity), 0),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false
      }
    };

    // 1. Adicionar ao carrinho
    const cartResponse = await fetch(`${melhorEnvioConfig.apiUrl}/me/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${melhorEnvioConfig.token}`,
        'User-Agent': 'RUGE Store'
      },
      body: JSON.stringify(etiquetaData)
    });

    if (!cartResponse.ok) {
      const error = await cartResponse.text();
      throw new Error(`Erro ao adicionar ao carrinho: ${error}`);
    }

    const etiqueta = await cartResponse.json();

    // 2. Comprar etiqueta (gastar créditos)
    const checkoutResponse = await fetch(`${melhorEnvioConfig.apiUrl}/me/shipment/checkout`, {
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

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text();
      throw new Error(`Erro ao comprar etiqueta: ${error}`);
    }

    console.log(`✅ Etiqueta comprada: ${etiqueta.id} - R$ ${etiqueta.price}`);

    return {
      success: true,
      etiquetaId: etiqueta.id,
      trackingCode: etiqueta.tracking || etiqueta.id, // Código de rastreamento
      price: etiqueta.price
    };

  } catch (error) {
    console.error('❌ Erro ao gerar etiqueta:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function salvarPedidoNoBanco({
  paymentId,
  payment,
  etiquetaId,
  trackingCode,
  shippingPrice,
  products,
  delivery_address,
  status = 'paid'
}) {
  try {
    // Aqui você salvaria no seu banco (Supabase, por exemplo)
    const pedido = {
      payment_id: paymentId,
      total_amount: payment.transaction_amount,
      customer_email: payment.payer.email,
      customer_name: delivery_address.nome,
      shipping_price: parseFloat(shippingPrice),
      shipping_tracking_code: trackingCode,
      melhor_envio_id: etiquetaId,
      delivery_address: JSON.stringify(delivery_address),
      products: JSON.stringify(products),
      status: status,
      created_at: new Date().toISOString()
    };

    console.log('💾 Salvando pedido no banco:', pedido);
    
    // Implementar salvamento no Supabase aqui
    // const { error } = await supabase.from('orders').insert(pedido);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao salvar no banco:', error);
    return { success: false, error: error.message };
  }
}

async function enviarEmailConfirmacao({ email, trackingCode, products, totalPago }) {
  try {
    console.log(`📧 Enviando email para ${email}`);
    console.log(`📦 Código de rastreamento: ${trackingCode}`);
    console.log(`💰 Total pago: R$ ${totalPago}`);
    
    // Aqui você implementaria o envio de email
    // Pode usar Nodemailer, SendGrid, etc.
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}
