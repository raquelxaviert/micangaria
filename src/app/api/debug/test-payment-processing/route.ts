import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { paymentService } from '@/lib/mercadopago/client';
import { MercadoPagoConfig, Payment } from 'mercadopago';

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
      console.warn(`[TestProcessing] Unknown Mercado Pago status: ${mpStatus}`);
      return 'pending';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payment_id, use_sandbox } = await request.json();
    
    if (!payment_id) {
      return NextResponse.json({ error: 'payment_id is required' }, { status: 400 });
    }
    
    console.log(`🧪 [TestProcessing] Testing payment processing for ID: ${payment_id}, use_sandbox: ${use_sandbox}`);
    
    const results: any = {
      payment_id,
      use_sandbox: use_sandbox || false,
      steps: [],
      environment_info: {
        NODE_ENV: process.env.NODE_ENV,
        has_production_token: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
        has_sandbox_token: !!process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN,
        production_token_type: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('APP_USR_') ? 'PRODUCTION' : 
                              process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-') ? 'SANDBOX' : 'UNKNOWN',
      }
    };
    
    // Step 1: Choose the right API configuration
    let paymentServiceToUse = paymentService; // Default to the existing service
    
    if (use_sandbox && process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN) {
      // Create a sandbox-specific client
      const sandboxClient = new MercadoPagoConfig({
        accessToken: process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN,
        options: {
          timeout: 5000,
        }
      });
      paymentServiceToUse = new Payment(sandboxClient);
      results.steps.push("Using SANDBOX API configuration");
    } else {
      results.steps.push("Using PRODUCTION API configuration");
    }
    
    // Step 2: Fetch payment details from Mercado Pago
    console.log(`[TestProcessing] Step 2: Fetching payment details from Mercado Pago...`);
    results.steps.push("Fetching payment from Mercado Pago");
    
    try {
      const paymentDetails = await paymentServiceToUse.get({ id: payment_id });
      results.payment_details = {
        id: paymentDetails.id,
        status: paymentDetails.status,
        external_reference: paymentDetails.external_reference,
        status_detail: paymentDetails.status_detail,
        date_created: paymentDetails.date_created,
        date_approved: paymentDetails.date_approved
      };
      results.steps.push("✅ Payment fetched successfully");
      console.log(`[TestProcessing] Payment details:`, results.payment_details);
    } catch (error: any) {
      results.steps.push(`❌ Error fetching payment: ${error.message}`);
      results.error = error.message;
      
      // If production failed and we haven't tried sandbox, try sandbox
      if (!use_sandbox && process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN) {
        results.steps.push("Production failed, trying SANDBOX...");
        try {
          const sandboxClient = new MercadoPagoConfig({
            accessToken: process.env.MERCADO_PAGO_SANDBOX_ACCESS_TOKEN,
            options: {
              timeout: 5000,
            }
          });
          const sandboxPaymentService = new Payment(sandboxClient);
          const paymentDetails = await sandboxPaymentService.get({ id: payment_id });
          
          results.payment_details = {
            id: paymentDetails.id,
            status: paymentDetails.status,
            external_reference: paymentDetails.external_reference,
            status_detail: paymentDetails.status_detail,
            date_created: paymentDetails.date_created,
            date_approved: paymentDetails.date_approved
          };
          results.steps.push("✅ Payment found in SANDBOX");
          results.found_in_sandbox = true;
        } catch (sandboxError: any) {
          results.steps.push(`❌ SANDBOX also failed: ${sandboxError.message}`);
          return NextResponse.json(results, { status: 500 });
        }
      } else {
        return NextResponse.json(results, { status: 500 });
      }
    }    
    // Step 3: Extract and validate data
    const externalReference = results.payment_details.external_reference;
    const paymentStatus = results.payment_details.status;
      console.log(`[TestProcessing] Step 3: Extracted data - External Reference: "${externalReference}", Payment Status: "${paymentStatus}"`);
    results.steps.push(`Extracted external_reference: ${externalReference}, status: ${paymentStatus}`);
    
    if (!externalReference || !paymentStatus) {
      results.steps.push("❌ Missing external_reference or payment status");
      return NextResponse.json(results, { status: 400 });
    }
    
    // Step 4: Map status
    const mappedOrderStatus = mapMercadoPagoStatusToYourStatus(paymentStatus);
    results.mapped_status = mappedOrderStatus;
    results.steps.push(`Mapped status: ${paymentStatus} → ${mappedOrderStatus}`);
    console.log(`[TestProcessing] Mapped status: ${paymentStatus} → ${mappedOrderStatus}`);
    
    // Step 5: Check if order exists in Supabase
    const supabase = await createClient();
      console.log(`[TestProcessing] Step 5: Checking if order exists with external_reference: ${externalReference}`);
    results.steps.push("Checking if order exists in Supabase");
    
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, external_reference, payment_id, created_at, updated_at')
      .eq('external_reference', externalReference)
      .single();

    if (fetchError) {
      console.error('[TestProcessing] Error fetching existing order:', fetchError);
      results.steps.push(`❌ Error fetching order: ${fetchError.message}`);
      results.fetch_error = fetchError;
    } else {
      console.log('[TestProcessing] Found existing order:', existingOrder);
      results.steps.push(`✅ Found existing order: ID ${existingOrder.id}, current status: ${existingOrder.status}`);
      results.existing_order = existingOrder;
    }
    
    // Step 6: Update the order
    console.log(`[TestProcessing] Step 6: Updating order status to ${mappedOrderStatus}`);
    results.steps.push("Updating order in Supabase");
    
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        status: mappedOrderStatus,
        payment_id: payment_id.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('external_reference', externalReference)
      .select();

    if (updateError) {
      console.error('[TestProcessing] Supabase update error:', updateError);
      results.steps.push(`❌ Update error: ${updateError.message}`);
      results.update_error = updateError;
    } else {
      console.log('[TestProcessing] Supabase update success:', updateData);
      results.steps.push(`✅ Order updated successfully`);
      results.update_result = updateData;
    }
      // Step 7: Verify the update
    console.log(`[TestProcessing] Step 7: Verifying the update`);
    results.steps.push("Verifying the update");
    
    const { data: updatedOrder, error: verifyError } = await supabase
      .from('orders')
      .select('id, status, external_reference, payment_id, updated_at')
      .eq('external_reference', externalReference)
      .single();

    if (verifyError) {
      results.steps.push(`❌ Verification error: ${verifyError.message}`);
      results.verify_error = verifyError;
    } else {
      results.steps.push(`✅ Verification complete - Final status: ${updatedOrder.status}`);
      results.final_order = updatedOrder;
    }
    
    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('❌ [TestProcessing] Unexpected error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Payment Processing Test Endpoint',
    usage: 'POST with { "payment_id": "1337580151", "use_sandbox": true }',
    description: 'This endpoint simulates the exact same logic as the webhook for debugging. Set use_sandbox=true to use sandbox API.',
    timestamp: new Date().toISOString()
  });
}
