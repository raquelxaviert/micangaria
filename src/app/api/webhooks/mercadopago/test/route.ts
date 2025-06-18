import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 WEBHOOK TEST: GET request received');
  
  return NextResponse.json({
    status: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: 'GET',
    message: 'Webhook is working correctly'
  });
}

export async function POST(request: NextRequest) {
  console.log('🧪 WEBHOOK TEST: POST request received');
  
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('🧪 WEBHOOK TEST: Headers received:', headers);
    console.log('🧪 WEBHOOK TEST: Body received:', body);
    
    return NextResponse.json({
      status: 'Test webhook received successfully',
      timestamp: new Date().toISOString(),
      headers: headers,
      body: body,
      message: 'This is a test endpoint for webhook debugging'
    });
  } catch (error) {
    console.error('🧪 WEBHOOK TEST: Error parsing request:', error);
    
    return NextResponse.json({
      status: 'Error in test webhook',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to parse webhook request'
    });
  }
} 