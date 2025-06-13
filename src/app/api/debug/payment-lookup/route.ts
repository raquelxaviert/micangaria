import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/mercadopago/client';

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get('id');
  
  if (!paymentId) {
    return NextResponse.json({ 
      error: 'Missing payment ID', 
      usage: 'Add ?id=PAYMENT_ID to test payment lookup' 
    }, { status: 400 });
  }

  console.log(`[PaymentLookupDebug] Testing payment lookup for ID: ${paymentId}`);
  
  try {
    const paymentDetails = await paymentService.get({ id: paymentId });
    
    console.log('[PaymentLookupDebug] Success! Payment details:', {
      id: paymentDetails.id,
      status: paymentDetails.status,
      external_reference: paymentDetails.external_reference,
      date_created: paymentDetails.date_created,
      payment_method_id: paymentDetails.payment_method_id
    });
    
    return NextResponse.json({
      success: true,
      payment: {
        id: paymentDetails.id,
        status: paymentDetails.status,
        external_reference: paymentDetails.external_reference,
        date_created: paymentDetails.date_created,
        payment_method_id: paymentDetails.payment_method_id,
        payment_type_id: paymentDetails.payment_type_id,
        transaction_amount: paymentDetails.transaction_amount,
        currency_id: paymentDetails.currency_id
      }
    });
    
  } catch (error: any) {
    console.error('[PaymentLookupDebug] Error:', {
      message: error.message,
      status: error.status,
      cause: error.cause
    });
    
    return NextResponse.json({
      error: 'Payment lookup failed',
      message: error.message,
      status: error.status,
      details: error.cause
    }, { status: 500 });
  }
}
