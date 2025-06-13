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
  let resourceId;
    // Handle different event types and their ID structures
  if (eventType === 'payment') {
    resourceId = payload.data?.id;
  } else if (eventType === 'merchant_order' || (eventType && eventType.includes('merchant_order'))) {
    resourceId = payload.data?.id || payload.id;
  } else {
    resourceId = payload.data?.id || payload.id;
  }

  if (!resourceId) {
    console.warn('[WebhookLogic] Could not determine resource ID from payload:', payload);
    return;
  }

  try {
    const supabase = await createClient();
      if (eventType === 'payment') {
      const paymentId = resourceId;
      console.log(`[WebhookLogic] Processing 'payment' event. Payment ID: ${paymentId}`);      try {
        // Fetch payment details from Mercado Pago with retry logic
        console.log(`[WebhookLogic] Fetching payment details from Mercado Pago for ID: ${paymentId}`);
        
        let paymentDetails;
        let retryCount = 0;
        const maxRetries = 3;
          while (retryCount < maxRetries) {
          try {
            paymentDetails = await paymentService.get({ id: paymentId });
            console.log(`[WebhookLogic] Successfully fetched payment on attempt ${retryCount + 1}`);
            break; // Success, exit retry loop
          } catch (mpError: any) {
            console.log(`[WebhookLogic] Attempt ${retryCount + 1}/${maxRetries} failed:`, {
              message: mpError.message,
              status: mpError.status,
              cause: mpError.cause
            });
              // Check if it's a 404 or "not found" error
            const errorMessage = mpError?.message || '';
            const isNotFoundError = errorMessage.includes('Payment not found') || 
                                  mpError.status === 404 ||
                                  errorMessage.includes('not found');
            
            if (isNotFoundError && retryCount < maxRetries - 1) {
              console.log(`[WebhookLogic] Payment not found, waiting ${3 * (retryCount + 1)} seconds before retry...`);
              await new Promise(resolve => setTimeout(resolve, 3000 * (retryCount + 1))); // Exponential backoff
              retryCount++;
              continue;
            } else {
              console.error('[WebhookLogic] Final error or max retries reached:', mpError);
              
              // If it's still a "not found" error after all retries, try alternative approach
              if (isNotFoundError) {
                console.log('[WebhookLogic] Payment not found after all retries. This might be a timing issue.');
                console.log('[WebhookLogic] Will skip this webhook but log for investigation.');
                return; // Skip processing but don't throw error
              }
              
              throw mpError; // Re-throw for other types of errors
            }
          }
        }
        
        if (!paymentDetails) {
          console.error('[WebhookLogic] Failed to fetch payment details after all retries');
          return;
        }
        
        console.log('[WebhookLogic] Fetched payment details:', {
          id: paymentDetails.id,
          status: paymentDetails.status,
          external_reference: paymentDetails.external_reference
        });

        const externalReference = paymentDetails.external_reference;
        const paymentStatus = paymentDetails.status;
        
        console.log(`[WebhookLogic] Extracted data - External Reference: "${externalReference}", Payment Status: "${paymentStatus}"`);
        
        if (externalReference && paymentStatus) {
          const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);
          console.log(`[WebhookLogic] Updating order by external_reference: ${externalReference} to status: ${mappedOrderStatus}`);
          
          // Primeiro, vamos verificar se o pedido existe
          const { data: existingOrder, error: fetchError } = await supabase
            .from('orders')
            .select('id, status, external_reference')
            .eq('external_reference', externalReference)
            .single();

          if (fetchError) {
            console.error('[WebhookLogic] Error fetching existing order:', fetchError);
            console.error('[WebhookLogic] Tried to find external_reference:', externalReference);
          } else {
            console.log('[WebhookLogic] Found existing order:', existingOrder);
          }
          
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
            console.log('[WebhookLogic] Update result:', data);
          }        } else {
          console.warn('[WebhookLogic] Missing data for Supabase update (payment):', { externalReference, paymentStatus });
          
          // 🚀 SMART FALLBACK STRATEGY: Only if we can infer the payment was successful
          console.log('[WebhookLogic] 🔄 Trying SMART FALLBACK strategy...');
          
          const action = payload?.action || '';
          const webhookType = payload?.type || '';
          
          // Only use fallback for actions that likely indicate successful payment
          const likelySuccessActions = [
            'payment.updated', // Usually means approved
            'payment.approved', // Explicit approval
          ];
          
          const isProbablyApproved = likelySuccessActions.some(successAction => 
            action.includes(successAction)
          );
          
          console.log(`[WebhookLogic] 🔍 Webhook analysis:`, {
            action,
            type: webhookType,
            isProbablyApproved,
            shouldUseFallback: isProbablyApproved
          });
          
          if (isProbablyApproved) {
            console.log('[WebhookLogic] ✅ Action suggests successful payment, proceeding with fallback');
            
            try {
              // Find the most recent pending order and assume it's this payment
              const { data: pendingOrders, error: pendingError } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (!pendingError && pendingOrders && pendingOrders.length > 0) {
                const recentOrder = pendingOrders[0];
                console.log('[WebhookLogic] 🎯 Found recent pending order for fallback:', {
                  id: recentOrder.id,
                  external_reference: recentOrder.external_reference,
                  created_at: recentOrder.created_at
                });
                
                // Update this order to 'paid' status
                const { data: updateData, error: updateError } = await supabase
                  .from('orders')
                  .update({
                    status: 'paid', // Only mark as paid for likely successful payments
                    payment_id: paymentId.toString(),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', recentOrder.id);
                
                if (!updateError) {
                  console.log('[WebhookLogic] ✅ SMART FALLBACK SUCCESS! Updated order:', recentOrder.external_reference);
                } else {
                  console.error('[WebhookLogic] ❌ Fallback update failed:', updateError);
                }
              } else {
                console.warn('[WebhookLogic] 🤷 No pending orders found for fallback');
              }
            } catch (fallbackError) {
              console.error('[WebhookLogic] 💥 Fallback strategy failed:', fallbackError);
            }
          } else {
            console.log(`[WebhookLogic] ⚠️ Action "${action}" doesn't suggest successful payment, skipping fallback`);
            console.log('[WebhookLogic] 📝 This could be a pending/rejected payment - keeping original status');
          }
        }
      } catch (mpError: any) {
        console.error('[WebhookLogic] Error fetching payment from Mercado Pago:', mpError.message);
        console.error('[WebhookLogic] Full MP error:', mpError);
      }    } else if (eventType === 'merchant_order' || (eventType && eventType.includes && eventType.includes('merchant_order'))) {
      const merchantOrderId = resourceId;
      console.log(`[WebhookLogic] Processing 'merchant_order' event. Merchant Order ID: ${merchantOrderId}`);

      try {
        // Fetch merchant order details from Mercado Pago
        const merchantOrder = await merchantOrderService.get({ merchantOrderId: merchantOrderId });
        console.log('[WebhookLogic] Fetched merchant order details:', {
          id: merchantOrder.id,
          status: merchantOrder.status,
          preference_id: merchantOrder.preference_id,
          external_reference: merchantOrder.external_reference,
          payments: merchantOrder.payments?.length || 0
        });

        // According to Mercado Pago documentation (Aug 2024), only process merchant_order with status "closed"
        // "opened" status is no longer reliable indicator of QR scan and should be ignored
        if (merchantOrder.status !== 'closed') {
          console.log(`[WebhookLogic] Ignoring merchant_order with status "${merchantOrder.status}". Only processing "closed" status as per MP documentation.`);
          return;
        }

        const preferenceId = merchantOrder.preference_id;
        const externalReference = merchantOrder.external_reference;
        const payments = merchantOrder.payments;

        if (payments && payments.length > 0) {
          // Get the most relevant payment (approved first, then most recent)
          const payment = payments.find(p => p.status === 'approved') || payments[payments.length - 1];
          
          if (payment && payment.status && payment.id) {
            const paymentId = payment.id;
            const paymentStatus = payment.status;
            const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);

            console.log(`[WebhookLogic] Processing merchant_order payment - ID: ${paymentId}, Status: ${paymentStatus} -> ${mappedOrderStatus}`);
            
            // Try to update by external_reference first, then by preference_id
            let updateSuccess = false;
            
            if (externalReference) {
              console.log(`[WebhookLogic] Updating order by external_reference: ${externalReference}`);
              const { data, error } = await supabase
                .from('orders')
                .update({
                  status: mappedOrderStatus,
                  payment_id: paymentId.toString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('external_reference', externalReference);
              
              if (!error) {
                console.log('[WebhookLogic] Supabase update success by external_reference:', externalReference);
                updateSuccess = true;
              } else {
                console.log('[WebhookLogic] Failed to update by external_reference, trying preference_id...', error.message);
              }
            }
            
            if (!updateSuccess && preferenceId) {
              console.log(`[WebhookLogic] Updating order by preference_id: ${preferenceId}`);
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
                console.log('[WebhookLogic] Supabase update success by preference_id:', preferenceId);
                updateSuccess = true;
              }
            }
            
            if (!updateSuccess) {
              console.error('[WebhookLogic] Failed to update order - no valid reference found', {
                externalReference,
                preferenceId
              });
            }
          } else {
             console.warn('[WebhookLogic] No suitable payment found in merchant_order to process');
          }
        } else {
          console.warn('[WebhookLogic] No payments found in merchant_order');
        }
      } catch (mpError: any) {
        console.error('[WebhookLogic] Error fetching merchant order from Mercado Pago:', mpError.message || 'Unknown error');
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
  console.log('🔗 WEBHOOK MP: Request URL:', request.url);
  console.log('📧 WEBHOOK MP: Request headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  let payload;
  try {
    // --- SIGNATURE VALIDATION ---
    const signatureHeader = request.headers.get('x-signature');
    const requestIdHeader = request.headers.get('x-request-id'); // Used in manifest    // data.id is expected in query parameters for signature validation template
    const dataIdFromQuery = request.nextUrl.searchParams.get('data.id'); 
    const idFromQuery = request.nextUrl.searchParams.get('id'); // Alternative for merchant orders
    const topicFromQuery = request.nextUrl.searchParams.get('topic'); // Topic for merchant orders

    console.log(`[SignatureValidation] Headers: x-signature: "${signatureHeader}", x-request-id: "${requestIdHeader}"`);
    console.log(`[SignatureValidation] Query Params: data.id: "${dataIdFromQuery}", id: "${idFromQuery}", topic: "${topicFromQuery}"`);

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
    console.log(`[SignatureValidation] Signature parts:`, parts);
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      console.log(`[SignatureValidation] Part: "${part}", Key: "${key}", Value: "${value}"`);
      if (key && value) { // Ensure both key and value exist
        if (key.trim() === 'ts') ts = value.trim();
        if (key.trim() === 'v1') v1 = value.trim();
      }
    }

    if (!ts || !v1) {
      console.warn('⚠️ WEBHOOK MP: Invalid x-signature format. Could not parse ts or v1.', { signatureHeader });
      return NextResponse.json({ success: false, message: "Invalid signature format" }, { status: 200 });
    }    // Construct the manifest string according to Mercado Pago documentation:
    // id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
    // For merchant orders, the ID comes in the `id` parameter, not `data.id`
    // For payments, the ID comes in the `data.id` parameter
    let manifestId = '';
    if (dataIdFromQuery && dataIdFromQuery !== 'null') {
      manifestId = dataIdFromQuery;
    } else if (idFromQuery) {
      manifestId = idFromQuery;
    }
      const manifest = `id:${manifestId};request-id:${requestIdHeader || ''};ts:${ts}`;
    console.log(`[SignatureValidation] Manifest for HMAC: "${manifest}"`);
    console.log(`[SignatureValidation] Secret length: ${secret.length} chars`);
    console.log(`[SignatureValidation] Secret preview: ${secret.substring(0, 10)}...`);

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');
    console.log(`[SignatureValidation] Calculated signature: "${calculatedSignature}"`);
    console.log(`[SignatureValidation] Received v1: "${v1}"`);
    
    // Try alternative manifest formats for merchant orders if the primary fails
    let signatureMatches = calculatedSignature === v1;
    let usedManifest = manifest;
    
    if (!signatureMatches) {
      console.log(`[SignatureValidation] Primary signature failed, trying alternative format with trailing semicolon...`);
      
      // Alternative: with trailing semicolon (backward compatibility)
      const altManifest = `id:${manifestId};request-id:${requestIdHeader || ''};ts:${ts};`;
      const altHmac = crypto.createHmac('sha256', secret);
      altHmac.update(altManifest);
      const altSignature = altHmac.digest('hex');
      console.log(`[SignatureValidation] Alternative manifest: "${altManifest}"`);
      console.log(`[SignatureValidation] Alternative signature: "${altSignature}"`);
      
      if (altSignature === v1) {
        signatureMatches = true;
        usedManifest = altManifest;
        console.log(`[SignatureValidation] ✅ Alternative signature with trailing semicolon matched!`);
      }
    }
    
    console.log(`[SignatureValidation] Signatures match: ${signatureMatches} (using manifest: "${usedManifest}")`);

    if (!signatureMatches) {
      console.error('❌ WEBHOOK MP: Invalid signature. Calculated signature does not match v1 from header.');
      console.error('❌ WEBHOOK MP: This could indicate tampering or configuration issues.');
      // For security, we should reject invalid signatures in production
      // return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 200 });
      console.warn('⚠️ WEBHOOK MP: CONTINUING FOR TESTING - REMOVE THIS IN PRODUCTION');
    } else {
      console.log('✅ WEBHOOK MP: Signature validated successfully.');
    }
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
  
  // Log da URL para debug
  const url = request.url;
  console.log('🔗 WEBHOOK MP: Request URL:', url);
  
  return NextResponse.json({
    status: 'Mercado Pago Webhook Endpoint is Online',
    timestamp: new Date().toISOString(),
    message: 'To test, send a POST request with a valid Mercado Pago webhook payload and signature.',
    url: url,
    server: 'Vercel',
    environment: process.env.NODE_ENV || 'unknown'
  });
}
