/**
 * 🛒 API PARA CRIAR PRE      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,ERÊNCIA DO MERCADO PAGO
 * 
 * Cria link de pagamento incluindo frete
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, metadata, back_urls, customerInfo } = body;

    console.log('🛒 API /api/mercadopago/create-preference chamada');
    
    // Verificar dados do cliente para evitar "pagar para si mesmo"
    if (customerInfo) {
      console.log('👤 Dados do cliente:', { 
        email: customerInfo.email, 
        name: customerInfo.name 
      });
    }

    // Configurar preferência do Mercado Pago
    const preference = {
      items: items,
      metadata: metadata, // Dados do frete e endereço
      back_urls: back_urls,
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
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
      },
      // Adicionar dados do pagador se fornecidos
      ...(customerInfo && {
        payer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: {
            area_code: customerInfo.phone?.substring(0, 2) || '11',
            number: customerInfo.phone?.substring(2) || '999999999'
          },
          identification: {
            type: 'CPF',
            number: customerInfo.document || '12345678909'
          }
        }
      })
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
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { message: 'Erro ao criar pagamento', error: errorMessage },
      { status: 500 }
    );
  }
}
