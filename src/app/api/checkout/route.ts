import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar o cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN!, // Token de sandbox
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, shippingOption, customerInfo, shippingAddress } = body;

    console.log('Dados recebidos:', {
      amount,
      shippingOption,
      customerInfo,
      shippingAddress,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const successUrl = `${baseUrl}/checkout/success`;
    const failureUrl = `${baseUrl}/checkout/failure`;
    const pendingUrl = `${baseUrl}/checkout/pending`;
    const webhookUrl = `${baseUrl}/api/webhooks/mercadopago`;

    // Criar preferência de pagamento
    const preference = new Preference(client);
    const preferenceData = {
      body: {
        items: [
          {
            id: 'order_' + Date.now(),
            title: 'Compra na Loja',
            unit_price: Number(amount),
            quantity: 1,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: customerInfo.name,
          email: customerInfo.email,
          identification: {
            type: 'CPF',
            number: customerInfo.cpf.replace(/\D/g, ''),
          },
          phone: {
            area_code: customerInfo.phone.replace(/\D/g, '').substring(0, 2),
            number: customerInfo.phone.replace(/\D/g, '').substring(2),
          },
          address: {
            zip_code: shippingAddress.zipCode.replace(/\D/g, ''),
            street_name: shippingAddress.street,
            street_number: shippingAddress.number,
            neighborhood: shippingAddress.neighborhood,
            city: shippingAddress.city,
            federal_unit: shippingAddress.state,
          },
        },
        shipments: {
          cost: Number(shippingOption.price),
          mode: 'not_specified',
          free_shipping: shippingOption.price === 0,
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        notification_url: webhookUrl,
        statement_descriptor: 'MICA NGUEIRA',
        external_reference: `order_${Date.now()}`,
        payment_methods: {
          installments: 12,
          default_installments: 1,
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      }
    };

    console.log('Dados da preferência:', JSON.stringify(preferenceData, null, 2));

    const result = await preference.create(preferenceData);
    console.log('Resultado da preferência:', result);

    if (!result.sandbox_init_point) {
      throw new Error('URL de pagamento sandbox não encontrada na resposta');
    }

    return NextResponse.json({
      init_point: result.sandbox_init_point,
      preference_id: result.id,
    });
  } catch (error: any) {
    console.error('Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    return NextResponse.json(
      { 
        error: 'Erro ao criar preferência de pagamento',
        details: error.message,
        response: error.response?.data
      },
      { status: 500 }
    );
  }
} 