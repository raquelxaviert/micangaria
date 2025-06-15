import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// Configurar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, shipping, total } = body;

    // Criar pagamento PIX
    const payment = new Payment(client);
    
    const paymentData = {
      transaction_amount: total,
      description: `Compra RÜGE - ${items.length} item(s)`,
      payment_method_id: 'pix',
      payer: {
        email: customer.email,
        first_name: customer.name.split(' ')[0],
        last_name: customer.name.split(' ').slice(1).join(' ') || customer.name.split(' ')[0],
      },
      metadata: {
        items: items.map((item: any) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        shipping_address: shipping.address,
        shipping_cost: shipping.cost,
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
    };

    const response = await payment.create({ body: paymentData });

    if (response.status === 'pending') {
      // Salvar pedido no Supabase
      const orderData = {
        id: response.id?.toString(),
        external_reference: response.id?.toString(),
        status: 'pending',
        payment_method: 'pix',
        total: total,
        subtotal: total - shipping.cost,
        shipping_cost: shipping.cost,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || null,
        shipping_address: shipping.address,
        items: items,
        payment_data: {
          pix_qr_code: response.point_of_interaction?.transaction_data?.qr_code,
          pix_qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
          expires_at: response.date_of_expiration,
        },
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (insertError) {
        console.error('Erro ao salvar pedido no Supabase:', insertError);
      }

      return NextResponse.json({
        success: true,
        payment_id: response.id,
        pix: {
          qr_code: response.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
          expires_at: response.date_of_expiration,
        },
      });
    } else {
      throw new Error(`Pagamento rejeitado: ${response.status_detail}`);
    }
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
