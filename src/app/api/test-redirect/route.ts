import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Simular parâmetros que o Mercado Pago envia
  const externalRef = searchParams.get('external_reference') || 'order_1750212164754';
  const paymentId = searchParams.get('payment_id') || '1337796279';
  const status = searchParams.get('status') || 'approved';
  const collectionStatus = searchParams.get('collection_status') || 'approved';
  
  console.log('Parâmetros de redirecionamento:', {
    external_reference: externalRef,
    payment_id: paymentId,
    status: status,
    collection_status: collectionStatus
  });

  // Determinar para qual página redirecionar baseado no status
  let redirectUrl;
  
  if (status === 'approved' || collectionStatus === 'approved') {
    redirectUrl = `/checkout/success?external_reference=${externalRef}&payment_id=${paymentId}&status=${status}`;
  } else if (status === 'rejected' || collectionStatus === 'rejected') {
    redirectUrl = `/checkout/failure?external_reference=${externalRef}&payment_id=${paymentId}&status=${status}`;
  } else {
    redirectUrl = `/checkout/pending?external_reference=${externalRef}&payment_id=${paymentId}&status=${status}`;
  }

  console.log('Redirecionando para:', redirectUrl);
  
  return NextResponse.redirect(new URL(redirectUrl, request.url));
} 