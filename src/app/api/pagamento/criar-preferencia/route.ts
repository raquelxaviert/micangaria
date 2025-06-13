import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * API para criar preferência de pagamento com frete incluído
 * 
 * Fluxo:
 * 1. Cliente escolhe produtos + frete
 * 2. Sistema cria preferência no Mercado Pago
 * 3. Cliente paga total (produtos + frete)
 * 4. Webhook processa pagamento e gera etiqueta automaticamente
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🛒 API /api/pagamento/criar-preferencia chamada');
    
    // Configurar Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    });

    const preference = new Preference(client);

    // Dados do pedido
    const {
      produtos,
      frete,
      cliente,
      enderecoEntrega
    } = body;
    
    console.log('👤 Dados do cliente:', { 
      email: cliente.email, 
      nome: cliente.nome 
    });

    // Calcular totais
    const subtotalProdutos = produtos.reduce((sum: number, p: any) => 
      sum + (p.preco * p.quantidade), 0
    );
    const valorFrete = parseFloat(frete.preco);
    const total = subtotalProdutos + valorFrete;

    // Criar itens para o Mercado Pago
    const items = [
      // Produtos
      ...produtos.map((produto: any) => ({
        id: produto.id,
        title: produto.nome,
        quantity: produto.quantidade,
        unit_price: produto.preco,
        currency_id: 'BRL'
      })),
      // Frete como item separado
      {
        id: `frete_${frete.id}`,
        title: `Frete - ${frete.nome} (${frete.prazo} dias)`,
        quantity: 1,
        unit_price: valorFrete,
        currency_id: 'BRL'
      }
    ];

    // Dados para webhook processar depois
    const metadata = {
      pedido_id: `RUGE_${Date.now()}`,
      produtos: JSON.stringify(produtos),
      frete: JSON.stringify(frete),
      enderecoEntrega: JSON.stringify(enderecoEntrega),
      subtotal_produtos: subtotalProdutos,
      valor_frete: valorFrete,
      total: total
    };

    // Criar preferência
    const preferenceData = {
      items,
      payer: {
        name: cliente.nome,
        email: cliente.email,
        phone: {
          number: cliente.telefone
        },
        address: {
          street_name: enderecoEntrega.endereco,
          street_number: enderecoEntrega.numero,
          zip_code: enderecoEntrega.cep
        }
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/erro`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/pendente`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      external_reference: metadata.pedido_id,
      metadata
    };

    console.log('[MERCADO PAGO] Criando preferência...');
    console.log(`[MERCADO PAGO] Total: R$ ${total.toFixed(2)} (Produtos: R$ ${subtotalProdutos.toFixed(2)} + Frete: R$ ${valorFrete.toFixed(2)})`);

    const response = await preference.create({ body: preferenceData });

    return NextResponse.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      total: total,
      breakdown: {
        produtos: subtotalProdutos,
        frete: valorFrete
      }
    });

  } catch (error) {
    console.error('[MERCADO PAGO] Erro ao criar preferência:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar pagamento'
    }, { status: 500 });
  }
}
