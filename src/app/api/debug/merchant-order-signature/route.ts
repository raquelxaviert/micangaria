import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Test merchant order signature validation
  // Based on the real webhook log data
  const testData = {
    id: '31698104907',
    requestId: 'f4163a87-4862-4f28-8363-e42d9959fb38',
    ts: '1749820657',
    expectedSignature: '479cf46ecb94d3796542c1aebe9467274d6d4dce79b609e21628f5e3e7541647'
  };

  const variations = [];

  // Try different manifest formats
  const manifestVariations = [
    `id:${testData.id};request-id:${testData.requestId};ts:${testData.ts};`,
    `id:${testData.id};request-id:${testData.requestId};ts:${testData.ts}`,
    `id:;request-id:${testData.requestId};ts:${testData.ts};`,
    `id:;request-id:${testData.requestId};ts:${testData.ts}`,
    `resource:${testData.id};request-id:${testData.requestId};ts:${testData.ts};`,
    `resource:${testData.id};request-id:${testData.requestId};ts:${testData.ts}`,
    `merchant_order:${testData.id};request-id:${testData.requestId};ts:${testData.ts};`,
    `merchant_order:${testData.id};request-id:${testData.requestId};ts:${testData.ts}`,
  ];

  for (let i = 0; i < manifestVariations.length; i++) {
    const manifest = manifestVariations[i];
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');
    
    variations.push({
      index: i,
      manifest,
      signature: calculatedSignature,
      matches: calculatedSignature === testData.expectedSignature
    });
  }

  return NextResponse.json({
    testData,
    secret: {
      exists: true,
      length: secret.length,
      preview: secret.substring(0, 10) + '...'
    },
    variations,
    matchingVariation: variations.find(v => v.matches) || null,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  // Test with custom data
  const body = await request.json();
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const { id, requestId, ts, expectedSignature } = body;
  
  if (!id || !requestId || !ts || !expectedSignature) {
    return NextResponse.json({
      error: 'Missing required fields',
      required: ['id', 'requestId', 'ts', 'expectedSignature']
    }, { status: 400 });
  }

  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const calculatedSignature = hmac.digest('hex');

  return NextResponse.json({
    input: { id, requestId, ts, expectedSignature },
    manifest,
    calculatedSignature,
    matches: calculatedSignature === expectedSignature,
    secret: {
      exists: true,
      length: secret.length,
      preview: secret.substring(0, 10) + '...'
    }
  });
}
