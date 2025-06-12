import { NextRequest, NextResponse } from 'next/server';

// Instalar: npm install mercadopago
import mercadopago from 'mercadopago';

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  sandbox: process.env.NODE_ENV !== 'production'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const preference = {
      items: body.items,
      payer: body.payer,
      back_urls: body.back_urls,
      auto_return: body.auto_return,
      payment_methods: body.payment_methods,
      notification_url: body.notification_url,
      statement_descriptor: 'RUGE VINTAGE',
      external_reference: `RUGE-${Date.now()}`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    };

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });

  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
