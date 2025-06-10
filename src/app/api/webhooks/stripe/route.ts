import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Only initialize Stripe if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe não está configurado no servidor' },
      { status: 503 }
    );
  }
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Check if signature is provided
  if (!signature) {
    return NextResponse.json(
      { error: 'Stripe signature não fornecida' },
      { status: 400 }
    );
  }

  // Check if webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe webhook secret não configurado' },
      { status: 503 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment succeeded:', session.id);
      
      // Aqui você pode:
      // 1. Salvar o pedido no banco de dados
      // 2. Enviar email de confirmação
      // 3. Atualizar estoque
      // 4. Notificar sistemas internos
      
      await handleSuccessfulPayment(session);
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      console.log('Session expired:', expiredSession.id);
      // Limpar dados temporários se necessário
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      // Notificar sobre falha no pagamento
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  // Check if Stripe is available
  if (!stripe) {
    console.error('Stripe não está configurado - não é possível processar pagamento');
    return;
  }

  try {
    // Recuperar detalhes completos da sessão
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer_details'],
    });

    const orderData = {
      sessionId: session.id,
      customerEmail: session.customer_email || session.customer_details?.email,
      customerName: session.metadata?.customerName,
      customerPhone: session.metadata?.customerPhone,
      amount: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      items: fullSession.line_items?.data || [],
      shippingAddress: session.shipping_address_collection,
      createdAt: new Date(),
    };

    // AQUI VOCÊ INTEGRARIA COM SEU BANCO DE DADOS
    // Exemplo com diferentes bancos:
    
    // 1. Para PostgreSQL/MySQL com Prisma:
    // await prisma.order.create({ data: orderData });
    
    // 2. Para MongoDB:
    // await db.collection('orders').insertOne(orderData);
    
    // 3. Para Firebase Firestore:
    // await db.collection('orders').add(orderData);
    
    // 4. Para Supabase:
    // await supabase.from('orders').insert(orderData);

    console.log('Order saved successfully:', orderData);

    // Enviar email de confirmação
    await sendConfirmationEmail(orderData);

  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

async function sendConfirmationEmail(orderData: any) {
  // AQUI VOCÊ INTEGRARIA COM SEU PROVEDOR DE EMAIL
  // Exemplos:
  
  // 1. Com SendGrid:
  // await sgMail.send({
  //   to: orderData.customerEmail,
  //   from: 'noreply@micangaria.com.br',
  //   subject: 'Pedido confirmado - Miçangaria',
  //   html: generateEmailTemplate(orderData)
  // });
  
  // 2. Com Resend:
  // await resend.emails.send({
  //   from: 'noreply@micangaria.com.br',
  //   to: orderData.customerEmail,
  //   subject: 'Pedido confirmado - Miçangaria',
  //   html: generateEmailTemplate(orderData)
  // });
  
  // 3. Com Nodemailer:
  // await transporter.sendMail({
  //   from: 'noreply@micangaria.com.br',
  //   to: orderData.customerEmail,
  //   subject: 'Pedido confirmado - Miçangaria',
  //   html: generateEmailTemplate(orderData)
  // });

  console.log('Confirmation email sent to:', orderData.customerEmail);
}

function generateEmailTemplate(orderData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pedido Confirmado - Miçangaria</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B5CF6;">🎉 Pedido Confirmado!</h1>
        <p style="color: #666; font-size: 16px;">
          Olá ${orderData.customerName}, seu pedido foi processado com sucesso!
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Detalhes do Pedido</h3>
        <p><strong>ID da Sessão:</strong> ${orderData.sessionId}</p>
        <p><strong>Total:</strong> R$ ${(orderData.amount / 100).toFixed(2)}</p>
        <p><strong>Status:</strong> Pago</p>
      </div>
      
      <div style="margin: 30px 0;">
        <p style="color: #666;">
          Começaremos a preparar suas peças artesanais com todo carinho. 
          Você receberá atualizações sobre o status do seu pedido.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          Dúvidas? Entre em contato conosco:<br>
          WhatsApp: (11) 99999-9999<br>
          Email: contato@micangaria.com.br
        </p>
      </div>
    </body>
    </html>
  `;
}
