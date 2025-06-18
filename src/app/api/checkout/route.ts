import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Configurar cliente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurar cliente do Mercado Pago com token de teste
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-1462764550696594-061211-e1e1043f436264c9bf3ff42860b3a608-2490474713';
const client = new MercadoPagoConfig({ 
  accessToken: accessToken
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Dados recebidos:', data);
    console.log('Itens recebidos na API:', data.items);

    // Validar dados obrigatórios
    if (!data.amount || !data.customerInfo || !data.shippingAddress || !data.shippingOption) {
      console.error('Dados obrigatórios ausentes:', {
        hasAmount: !!data.amount,
        hasCustomerInfo: !!data.customerInfo,
        hasShippingAddress: !!data.shippingAddress,
        hasShippingOption: !!data.shippingOption
      });
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      );
    }

    // Gerar ID único para o pedido
    const orderId = `order_${Date.now()}`;

    // URLs base - usando uma URL pública para teste
    const baseUrl = 'https://www.rugebrecho.com';
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
            id: orderId,
            title: "Compra na Loja",
            unit_price: data.amount,
            quantity: 1,
            currency_id: "BRL"
          }
        ],
        payer: {
          name: data.customerInfo.name,
          email: data.customerInfo.email,
          identification: {
            type: "CPF",
            number: data.customerInfo.cpf
          },
          phone: {
            area_code: data.customerInfo.phone.substring(0, 2),
            number: data.customerInfo.phone.substring(2)
          },
          address: {
            zip_code: data.shippingAddress.zipCode.replace(/\D/g, ''),
            street_name: data.shippingAddress.street,
            street_number: data.shippingAddress.number,
            neighborhood: data.shippingAddress.neighborhood,
            city: data.shippingAddress.city,
            federal_unit: data.shippingAddress.state
          }
        },
        shipments: {
          cost: data.shippingOption.price,
          mode: "not_specified",
          free_shipping: false
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl
        },
        notification_url: webhookUrl,
        statement_descriptor: "MICA NGUEIRA",
        external_reference: orderId,
        payment_methods: {
          installments: 12,
          default_installments: 1
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    };

    console.log('Dados da preferência:', JSON.stringify(preferenceData, null, 2));

    try {
      const result = await preference.create(preferenceData);
      console.log('Resultado da preferência:', result);

      // Criar pedido no Supabase
      const orderData = {
        user_id: data.userId,
        preference_id: result.id,
        external_reference: orderId,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        subtotal: data.amount - data.shippingOption.price,
        shipping_cost: data.shippingOption.price,
        total: data.amount,
        items: data.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id,
          imageUrl: item.imageUrl
        })),
        shipping_option: data.shippingOption,
        customer_info: data.customerInfo,
        shipping_address: data.shippingAddress,
        payment_status: 'pending',
        shipping_status: 'pending',
        status: 'pending'
      };

      console.log('Dados do pedido sendo salvos:', JSON.stringify(orderData, null, 2));

      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderData);

      if (orderError) {
        console.error('Erro ao criar pedido:', orderError);
        throw new Error('Erro ao criar pedido no banco de dados');
      }

      console.log('Resposta final:', {
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        preference_id: result.id
      });

      // Determinar se deve usar sandbox ou produção
      const isProduction = process.env.NODE_ENV === 'production';
      const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true' || !isProduction;
      
      // Usar sandbox_init_point se estiver em modo sandbox
      const redirectUrl = isSandbox ? result.sandbox_init_point : result.init_point;
      console.log('URL de redirecionamento escolhida:', redirectUrl);
      console.log(`🔧 Usando ${isSandbox ? 'sandbox_init_point' : 'init_point'} (modo ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'})`);

      return NextResponse.json({
        init_point: redirectUrl,
        sandbox_init_point: result.sandbox_init_point,
        preference_id: result.id,
        note: `Using ${isSandbox ? 'sandbox' : 'production'} mode`
      });
    } catch (mpError: any) {
      console.error('Erro do Mercado Pago:', {
        message: mpError.message,
        error: mpError.error,
        status: mpError.status,
        cause: mpError.cause
      });
      throw new Error(`Erro ao criar preferência de pagamento: ${mpError.message}`);
    }

  } catch (error: any) {
    console.error('Erro detalhado:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
} 