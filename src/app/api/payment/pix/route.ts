import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
  }
});

const payment = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const paymentData = {
      transaction_amount: body.amount,
      description: body.description,
      payment_method_id: 'pix',
      payer: {
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        identification: body.identificationType && body.identificationNumber ? {
          type: body.identificationType,
          number: body.identificationNumber
        } : undefined
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      external_reference: `RUGE-PIX-${Date.now()}`
    };

    const response = await payment.create({ body: paymentData });

    return NextResponse.json({
      id: response.id,
      status: response.status,
      qr_code: response.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: response.point_of_interaction?.transaction_data?.ticket_url
    });

  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
