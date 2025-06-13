import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Get all the data we need for signature validation
    const url = new URL(request.url);
    const headers = Object.fromEntries(request.headers.entries());
    const body = await request.text();
    
    // Extract signature components
    const xSignature = headers['x-signature'];
    const xRequestId = headers['x-request-id'];
    const dataId = url.searchParams.get('data.id');
    
    console.log('🔍 [SignatureDebug] Headers x-signature:', xSignature);
    console.log('🔍 [SignatureDebug] Headers x-request-id:', xRequestId);
    console.log('🔍 [SignatureDebug] Query data.id:', dataId);
    console.log('🔍 [SignatureDebug] Body:', body);
    
    if (!xSignature) {
      return NextResponse.json({
        error: 'Missing x-signature header',
        headers: headers
      });
    }
    
    // Parse signature
    const signatureParts = xSignature.split(',');
    let ts = '';
    let v1 = '';
    
    signatureParts.forEach(part => {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') v1 = value;
    });
    
    // Build manifest according to Mercado Pago docs
    let manifest = '';
    if (dataId) manifest += `id:${dataId};`;
    if (xRequestId) manifest += `request-id:${xRequestId};`;
    if (ts) manifest += `ts:${ts};`;
    
    console.log('🔍 [SignatureDebug] Parsed ts:', ts);
    console.log('🔍 [SignatureDebug] Parsed v1:', v1);
    console.log('🔍 [SignatureDebug] Manifest:', manifest);
    
    // Get secret
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    console.log('🔍 [SignatureDebug] Secret exists:', !!secret);
    console.log('🔍 [SignatureDebug] Secret length:', secret?.length || 0);
    console.log('🔍 [SignatureDebug] Secret preview:', secret?.substring(0, 10) + '...');
    
    if (!secret) {
      return NextResponse.json({
        error: 'Missing webhook secret',
        manifest,
        parsed: { ts, v1 }
      });
    }
    
    // Calculate signature
    const calculatedSignature = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');
    
    console.log('🔍 [SignatureDebug] Calculated signature:', calculatedSignature);
    console.log('🔍 [SignatureDebug] Received v1:', v1);
    console.log('🔍 [SignatureDebug] Signatures match:', calculatedSignature === v1);
    
    // Test variations of the manifest (in case there are format differences)
    const variations = [
      manifest,
      manifest.toLowerCase(),
      manifest.replace(/;$/, ''), // Remove trailing semicolon
      `id:${dataId || ''};request-id:${xRequestId || ''};ts:${ts};`,
    ];
    
    const testResults = variations.map((testManifest, index) => {
      const testSignature = crypto
        .createHmac('sha256', secret)
        .update(testManifest)
        .digest('hex');
      
      return {
        index,
        manifest: testManifest,
        signature: testSignature,
        matches: testSignature === v1
      };
    });
    
    return NextResponse.json({
      original: {
        xSignature,
        xRequestId, 
        dataId,
        body: body.substring(0, 200) + '...'
      },
      parsed: {
        ts,
        v1,
        manifest
      },
      secret: {
        exists: !!secret,
        length: secret?.length || 0,
        preview: secret?.substring(0, 10) + '...'
      },
      calculated: {
        signature: calculatedSignature,
        matches: calculatedSignature === v1
      },
      variations: testResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [SignatureDebug] Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Signature Debug Endpoint',
    usage: 'Send a POST request with the same headers and body as a webhook',
    description: 'This endpoint will debug the signature validation process step by step',
    timestamp: new Date().toISOString()
  });
}
