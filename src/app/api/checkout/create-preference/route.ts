import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * 🛒 API para criar preferência de pagamento com frete incluído
 * 
 * FLUXO:
 * 1. Cliente escolhe produtos + frete
 * 2. Sistema calcula total (produtos + frete)
 * 3. Cria preferência no Mercado Pago
 * 4. Cliente paga o total
 * 5. Webhook processa e gera etiqueta automaticamente
 */

// Configuração do Mercado Pago
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ MERCADO_PAGO_ACCESS_TOKEN not configured');
}

const client = accessToken ? new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
}) : null;

const preference = client ? new Preference(client) : null;

export async function POST(request: NextRequest) {
  try {
    // Verificar se estamos em ambiente de build
    if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
      // Ambiente local, prosseguir normalmente
    } else if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      // Em produção, verificar se as variáveis essenciais existem
      console.warn('⚠️ Environment variables not configured for production build');
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const {
      items, // Produtos do carrinho
      shippingOption, // Opção de frete escolhida
      customerInfo, // Dados do cliente
      shippingAddress // Endereço de entrega
    } = body;

    // Validação defensiva para preço do frete
    if (!shippingOption || isNaN(parseFloat(shippingOption.price))) {
      console.error('❌ Frete inválido:', shippingOption);
      return NextResponse.json(
        {
          success: false,
          error: 'Opção de frete inválida. Não foi possível calcular o valor do frete.',
          details: shippingOption
        },
        { status: 400 }
      );
    }

    console.log('🛒 Criando preferência de pagamento...');
    console.log('📦 Items:', items.length);
    console.log('🚚 Frete:', shippingOption.name, '- R$', shippingOption.price);

    // Calcular total dos produtos
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );
    
    const shippingCost = parseFloat(shippingOption.price);
    const total = subtotal + shippingCost;

    console.log('💰 Subtotal produtos: R$', subtotal.toFixed(2));
    console.log('💰 Custo frete: R$', shippingCost.toFixed(2));
    console.log('💰 Total final: R$', total.toFixed(2));

    // Preparar itens para o Mercado Pago
    const mercadoPagoItems = [
      // Produtos
      ...items.map((item: any) => ({
        id: item.id,
        title: item.title,
        category_id: 'fashion',
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: item.unit_price
      })),
      // Frete como item separado
      {
        id: 'shipping',
        title: `Frete - ${shippingOption.name}`,
        category_id: 'shipping',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: shippingCost
      }
    ];

    // Dados do comprador
    const payer = {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: {
        area_code: customerInfo.phone?.substring(0, 2) || '11',
        number: customerInfo.phone?.substring(2) || '999999999'
      },
      identification: {
        type: 'CPF',
        number: customerInfo.document || '12345678901'
      },
      address: {
        street_name: shippingAddress.address,
        street_number: String(shippingAddress.number || 1),
        zip_code: shippingAddress.postal_code
      }
    };

    // Criar preferência
    const preferenceData = {
      items: mercadoPagoItems,
      payer,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      shipments: {
        cost: shippingCost,
        mode: 'not_specified'
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending`
      },
      auto_return: 'approved',
      external_reference: `RUGE-${Date.now()}`, // ID único do pedido
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      metadata: {
        // Dados para gerar etiqueta depois do pagamento
        shipping_option: shippingOption,
        shipping_address: shippingAddress,
        customer_info: customerInfo,
        items: items.map((item: any) => ({
          id: item.id,
          name: item.title,
          quantity: item.quantity,
          weight: item.weight || 0.3,
          dimensions: item.dimensions || { width: 20, height: 5, length: 30 }
        }))
      }    };

    // Verificar se o Mercado Pago está configurado
    if (!preference) {
      return NextResponse.json(
        { success: false, error: 'Payment service not configured' },
        { status: 503 }
      );
    }

    const response = await preference.create({ body: preferenceData });console.log('✅ Preferência criada:', response.id);

    // Persistir pedido no Supabase
    if (supabaseAdmin) {
      await supabaseAdmin.from('orders').insert({
        user_id: customerInfo.id || null,
        preference_id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        total: total,
        breakdown: { subtotal, shipping: shippingCost, total },
        items: items,
        shipping_option: shippingOption,
        status: 'pending'
      });

      console.log('💾 Pedido salvo no Supabase:', response.id);
    } else {
      console.warn('⚠️ Supabase não configurado - pedido não foi salvo no banco');
    }

    return NextResponse.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point, 
      sandbox_init_point: response.sandbox_init_point,
      total: total,
      breakdown: {
        subtotal: subtotal,
        shipping: shippingCost,
        total: total
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar pagamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
