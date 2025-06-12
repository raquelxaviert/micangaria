/**
 * 🛒 API PARA CRIAR PREFERÊNCIA DO MERCADO PAGO
 * 
 * Cria link de pagamento incluindo frete
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, metadata, back_urls } = body;

    // Configurar preferência do Mercado Pago
    const preference = {
      items: items,
      metadata: metadata, // Dados do frete e endereço
      back_urls: back_urls,
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`,
      statement_descriptor: 'RUGE STORE',
      external_reference: `order_${Date.now()}`, // Referência única
      expires: false,
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12, // Até 12x
        default_installments: 1
      },
      shipments: {
        mode: 'not_specified' // Frete já calculado separadamente
      }
    };

    // Criar preferência no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro Mercado Pago:', error);
      throw new Error('Erro ao criar preferência de pagamento');
    }

    const preferenceData = await response.json();
    
    console.log('💳 Preferência criada:', preferenceData.id);
    
    return NextResponse.json({
      id: preferenceData.id,
      init_point: preferenceData.init_point, // Link para pagamento
      sandbox_init_point: preferenceData.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    return NextResponse.json(
      { message: 'Erro ao criar pagamento', error: error.message },
      { status: 500 }
    );
  }
}
