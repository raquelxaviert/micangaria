import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/mercadopago/client';

export async function GET(request: NextRequest) {
  try {
    // Test if we can connect to Mercado Pago API
    const tokenInfo = {
      has_token: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      token_length: process.env.MERCADO_PAGO_ACCESS_TOKEN?.length || 0,
      token_prefix: process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 15) || 'NOT_SET',
      token_suffix: process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(-10) || 'NOT_SET',
      is_test_token: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-') || false,
      is_app_usr_token: process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('APP_USR-') || false,
    };

    // Try to make a simple API call to test connectivity
    let api_test_result = 'NOT_TESTED';
    try {
      // Try to get a fake payment to test API connectivity
      await paymentService.get({ id: '999999999' });
    } catch (error: any) {
      // We expect this to fail, but the error message tells us if the API is working
      if (error.message?.includes('not found') || error.message?.includes('Payment not found')) {
        api_test_result = 'API_WORKING_TOKEN_VALID';
      } else if (error.message?.includes('Invalid') || error.message?.includes('401')) {
        api_test_result = 'TOKEN_INVALID';
      } else {
        api_test_result = `OTHER_ERROR: ${error.message}`;
      }
    }

    return NextResponse.json({
      token_info: tokenInfo,
      api_test_result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
