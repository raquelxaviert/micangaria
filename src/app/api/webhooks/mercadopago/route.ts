import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { paymentService, merchantOrderService } from '@/lib/mercadopago/client';

// Helper function to map Mercado Pago payment statuses to your application's order statuses
function mapMercadoPagoStatusToYourStatus(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved': return 'paid';
    case 'pending': return 'pending';
    case 'in_process': return 'processing';
    case 'rejected': return 'payment_failed';
    case 'cancelled': return 'cancelled';
    case 'refunded': return 'refunded';
    default:
      console.warn(`[WebhookLogic] Unknown Mercado Pago status: ${mpStatus}`);
      return 'pending';
  }
}

async function handleWebhookEvent(payload: any) {
  console.log('⚙️ [WebhookLogic] Received payload for processing:', {
    type: payload?.type,
    action: payload?.action,
    payload_id: payload?.id,
    payload_data_id: payload?.data?.id,
    user_id: payload?.user_id,
  });

  const eventType = payload.type;
  const resourceId = eventType === 'payment' ? payload.data?.id : payload.id;

  if (!resourceId) {
    console.warn('[WebhookLogic] Could not determine resource ID from payload:', payload);
    return;
  }

  try {
    const supabase = await createClient();
      if (eventType === 'payment') {
      const paymentId = resourceId;
      console.log(`[WebhookLogic] Processing 'payment' event. Payment ID: ${paymentId}`);

      try {
        // Fetch payment details from Mercado Pago
        const paymentDetails = await paymentService.get({ id: paymentId });
        console.log('[WebhookLogic] Fetched payment details:', {
          id: paymentDetails.id,
          status: paymentDetails.status,
          external_reference: paymentDetails.external_reference
        });

        const externalReference = paymentDetails.external_reference;
        const paymentStatus = paymentDetails.status;
        
        if (externalReference && paymentStatus) {
          const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);
          console.log(`[WebhookLogic] Updating order by external_reference: ${externalReference} to status: ${mappedOrderStatus}`);
          
          const { data, error } = await supabase
            .from('orders')
            .update({
              status: mappedOrderStatus,
              payment_id: paymentId.toString(),
              updated_at: new Date().toISOString(),
            })
            .eq('external_reference', externalReference);

          if (error) {
            console.error('[WebhookLogic] Supabase update error for payment:', error);
          } else {
            console.log('[WebhookLogic] Supabase update success for payment, external_reference:', externalReference);
          }
        } else {
          console.warn('[WebhookLogic] Missing data for Supabase update (payment):', { externalReference, paymentStatus });
        }
      } catch (mpError: any) {
        console.error('[WebhookLogic] Error fetching payment from Mercado Pago:', mpError.message);
      }

    } else if (eventType === 'topic_merchant_order_wh') {
      const merchantOrderId = resourceId;
      console.log(`[WebhookLogic] Processing 'merchant_order' event. Merchant Order ID: ${merchantOrderId}`);

      try {
        // Fetch merchant order details from Mercado Pago
        const merchantOrder = await merchantOrderService.get({ merchantOrderId: merchantOrderId });
        console.log('[WebhookLogic] Fetched merchant order details:', {
          id: merchantOrder.id,
          preference_id: merchantOrder.preference_id,
          payments: merchantOrder.payments?.length || 0
        });

        const preferenceId = merchantOrder.preference_id;
        const payments = merchantOrder.payments;

        if (preferenceId && payments && payments.length > 0) {
          // Get the most relevant payment (approved first, then most recent)
          const payment = payments.find(p => p.status === 'approved') || payments[payments.length - 1];
          
          if (payment && payment.status && payment.id) {
            const paymentId = payment.id;
            const paymentStatus = payment.status;
            const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);

            console.log(`[WebhookLogic] Updating order by preference_id: ${preferenceId} to status: ${mappedOrderStatus} based on payment ${paymentId}`);
            
            const { data, error } = await supabase
              .from('orders')
              .update({
                status: mappedOrderStatus,
                payment_id: paymentId.toString(),
                updated_at: new Date().toISOString(),
              })
              .eq('preference_id', preferenceId);

            if (error) {
              console.error('[WebhookLogic] Supabase update error for merchant_order:', error);
            } else {
              console.log('[WebhookLogic] Supabase update success for merchant_order, preference_id:', preferenceId);
            }
          } else {
             console.warn('[WebhookLogic] No suitable payment found in merchant_order to process');
          }
        } else {
          console.warn('[WebhookLogic] Missing data for Supabase update (merchant_order):', { preferenceId, payments: payments?.length });
        }
      } catch (mpError: any) {
        console.error('[WebhookLogic] Error fetching merchant order from Mercado Pago:', mpError.message);
      }
    } else {
      console.log(`[WebhookLogic] Received unhandled event type: ${eventType}`);
    }
  } catch (err: any) {
    console.error('[WebhookLogic] Error during event processing:', err.message, err.stack);
  }

  console.log('✅ [WebhookLogic] Processing finished for resource ID:', resourceId);
}

export async function POST(request: NextRequest) {
  console.log('🔔 WEBHOOK MP: Request received.');
  let payload;

  try {
    // --- SIGNATURE VALIDATION ---
    const signatureHeader = request.headers.get('x-signature');
    const requestIdHeader = request.headers.get('x-request-id'); // Used in manifest
    // data.id is expected in query parameters for signature validation template
    const dataIdFromQuery = request.nextUrl.searchParams.get('data.id'); 

    console.log(`[SignatureValidation] Headers: x-signature: "${signatureHeader}", x-request-id: "${requestIdHeader}"`);
    console.log(`[SignatureValidation] Query Params: data.id: "${dataIdFromQuery}"`);

    if (!signatureHeader) {
      console.warn('⚠️ WEBHOOK MP: Missing x-signature header. This is required for validation.');
      // Respond 200 to MP to prevent retries, but indicate failure.
      return NextResponse.json({ success: false, message: "Missing x-signature header" }, { status: 200 });
    }

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) {
      console.error('❌ WEBHOOK MP: Critical: MERCADOPAGO_WEBHOOK_SECRET is not configured on the server.');
      return NextResponse.json({ success: false, message: "Webhook secret not configured" }, { status: 200 });
    }

    let ts: string | undefined;
    let v1: string | undefined; // This is the hash from Mercado Pago
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) { // Ensure both key and value exist
        if (key.trim() === 'ts') ts = value.trim();
        if (key.trim() === 'v1') v1 = value.trim();
      }
    }

    if (!ts || !v1) {
      console.warn('⚠️ WEBHOOK MP: Invalid x-signature format. Could not parse ts or v1.', { signatureHeader });
      return NextResponse.json({ success: false, message: "Invalid signature format" }, { status: 200 });
    }

    // Construct the manifest string according to Mercado Pago documentation:
    // id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
    // If a value (dataIdFromQuery or requestIdHeader) is not present, it should be an empty string for that part.
    const manifest = `id:${dataIdFromQuery || ''};request-id:${requestIdHeader || ''};ts:${ts};`;
    console.log(`[SignatureValidation] Manifest for HMAC: "${manifest}"`);

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');
    console.log(`[SignatureValidation] Calculated signature: "${calculatedSignature}", Received v1: "${v1}"`);

    if (calculatedSignature !== v1) {
      console.error('❌ WEBHOOK MP: Invalid signature. Calculated signature does not match v1 from header.');
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 200 });
    }
    
    console.log('✅ WEBHOOK MP: Signature validated successfully.');
    // --- END SIGNATURE VALIDATION ---

    payload = await request.json();
    console.log('📄 WEBHOOK MP: Payload parsed. Type:', payload?.type, 'Action:', payload?.action, 'ID from body:', payload?.id, 'Data.id from body:', payload?.data?.id);

    if (payload) {
      // Asynchronously process the event.
      // This ensures we respond quickly to Mercado Pago.
      handleWebhookEvent(payload).catch(processingError => {
        console.error('💥 WEBHOOK MP: Error during asynchronous event processing (handleWebhookEvent):', processingError);
      });
    }

    // IMPORTANT: Respond to Mercado Pago with a 200 OK quickly.
    return NextResponse.json({ success: true, message: "Webhook received, signature validated, and processing initiated" }, { status: 200 });

  } catch (error: any) {
    console.error('❌ WEBHOOK MP: Error in POST handler (e.g., parsing request body):', error.message, error.stack);
    // Even if our processing fails or we can't parse, Mercado Pago expects a 2xx to stop retries.
    return NextResponse.json(
      { success: false, message: "Webhook handler error", error: error.message },
      { status: 200 } 
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('ℹ️ WEBHOOK MP: GET request received (status check).');
  return NextResponse.json({
    status: 'Mercado Pago Webhook Endpoint is Online',
    timestamp: new Date().toISOString(),
    message: 'To test, send a POST request with a valid Mercado Pago webhook payload and signature.'
  });
}
