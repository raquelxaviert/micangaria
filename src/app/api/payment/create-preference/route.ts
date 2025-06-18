import { NextRequest, NextResponse } from 'next/server';

// Instalar: npm install mercadopago
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
  }
});

const preference = new Preference(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🛒 API /api/payment/create-preference chamada');
    
    // Verificar se temos dados do pagador para evitar "pagar para si mesmo"
    if (body.payer) {
      console.log('👤 Dados do pagador:', { 
        email: body.payer.email, 
        name: body.payer.first_name + ' ' + (body.payer.last_name || '') 
      });
    }

    const preferenceData = {
      items: body.items,
      payer: body.payer,
      back_urls: body.back_urls,
      auto_return: body.auto_return,
      payment_methods: body.payment_methods,
      notification_url: body.notification_url || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      statement_descriptor: 'RUGE VINTAGE',
      external_reference: `RUGE-${Date.now()}`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    };

    const response = await preference.create({ body: preferenceData });

    console.log('✅ Preferência criada:', response.id);

    // Determinar se deve usar sandbox ou produção
    // Usar a variável de ambiente MERCADO_PAGO_SANDBOX
    const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true';

    return NextResponse.json({
      id: response.id,
      init_point: isSandbox ? response.sandbox_init_point : response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
