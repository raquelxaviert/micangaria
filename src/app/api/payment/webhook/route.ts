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
    
    console.log('Webhook recebido:', body);

    // Verificar se é uma notificação de pagamento
    if (body.type === 'payment') {
      const paymentId = body.data.id;
        // Buscar dados completos do pagamento
      const paymentData = await payment.get({ id: paymentId });
      
      console.log('Status do pagamento:', paymentData.status);
      
      // Processar baseado no status
      switch (paymentData.status) {
        case 'approved':
          await handlePaymentApproved(paymentData);
          break;
        case 'pending':
          await handlePaymentPending(paymentData);
          break;
        case 'in_process':
          await handlePaymentInProcess(paymentData);
          break;
        case 'rejected':
          await handlePaymentRejected(paymentData);
          break;
        case 'cancelled':
          await handlePaymentCancelled(paymentData);
          break;
        case 'refunded':
          await handlePaymentRefunded(paymentData);
          break;
        default:
          console.log('Status não tratado:', paymentData.status);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}

// Funções para tratar cada status de pagamento
async function handlePaymentApproved(payment: any) {
  console.log('Pagamento aprovado:', payment.id);
  
  // Aqui você faria:
  // 1. Atualizar status do pedido no banco
  // 2. Enviar email de confirmação
  // 3. Gerar nota fiscal
  // 4. Atualizar estoque
  // 5. Notificar sistema de logística
  
  // Exemplo básico:
  // await updateOrderStatus(payment.external_reference, 'paid');
  // await sendConfirmationEmail(payment.payer.email, payment.external_reference);
  // await updateInventory(payment.additional_info?.items || []);
}

async function handlePaymentPending(payment: any) {
  console.log('Pagamento pendente:', payment.id);
  
  // Para PIX, normalmente fica pendente até ser pago
  // Para boleto, fica pendente até vencimento
  
  // await updateOrderStatus(payment.external_reference, 'pending');
}

async function handlePaymentInProcess(payment: any) {
  console.log('Pagamento em processamento:', payment.id);
  
  // Comum para cartões que estão sendo processados
  // await updateOrderStatus(payment.external_reference, 'processing');
}

async function handlePaymentRejected(payment: any) {
  console.log('Pagamento rejeitado:', payment.id);
  
  // Pagamento foi negado (cartão sem limite, dados inválidos, etc.)
  // await updateOrderStatus(payment.external_reference, 'rejected');
  // await sendRejectionEmail(payment.payer.email, payment.external_reference);
}

async function handlePaymentCancelled(payment: any) {
  console.log('Pagamento cancelado:', payment.id);
  
  // Cliente cancelou ou expirou
  // await updateOrderStatus(payment.external_reference, 'cancelled');
  // await restoreInventory(payment.additional_info?.items || []);
}

async function handlePaymentRefunded(payment: any) {
  console.log('Pagamento estornado:', payment.id);
  
  // Estorno foi processado
  // await updateOrderStatus(payment.external_reference, 'refunded');
  // await restoreInventory(payment.additional_info?.items || []);
  // await sendRefundEmail(payment.payer.email, payment.external_reference);
}

// GET para verificação do Mercado Pago
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Webhook ativo' });
}
