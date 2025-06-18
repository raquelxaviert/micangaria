import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [SignatureDebug] Debugando validação de assinatura...');
    
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('📄 [SignatureDebug] Headers recebidos:', headers);
    console.log('📦 [SignatureDebug] Body recebido:', body);
    
    // Extrair dados para validação
    const signatureHeader = headers['x-signature'];
    const requestIdHeader = headers['x-request-id'];
    const dataIdFromQuery = request.nextUrl.searchParams.get('data.id');
    const idFromQuery = request.nextUrl.searchParams.get('id');
    
    console.log('🔍 [SignatureDebug] Dados extraídos:', {
      signatureHeader,
      requestIdHeader,
      dataIdFromQuery,
      idFromQuery
    });
    
    if (!signatureHeader) {
      return NextResponse.json({
        success: false,
        error: 'Header x-signature não encontrado',
        headers_received: Object.keys(headers)
      });
    }
    
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({
        success: false,
        error: 'MERCADOPAGO_WEBHOOK_SECRET não configurado'
      });
    }
    
    // Parsear assinatura
    let ts: string | undefined;
    let v1: string | undefined;
    const parts = signatureHeader.split(',');
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) {
        if (key.trim() === 'ts') ts = value.trim();
        if (key.trim() === 'v1') v1 = value.trim();
      }
    }
    
    console.log('🔍 [SignatureDebug] Assinatura parseada:', { ts, v1 });
    
    if (!ts || !v1) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível extrair ts ou v1 da assinatura',
        signatureHeader,
        parts
      });
    }
    
    // Determinar ID do manifesto
    let manifestId = '';
    if (dataIdFromQuery && dataIdFromQuery !== 'null') {
      manifestId = dataIdFromQuery;
    } else if (idFromQuery) {
      manifestId = idFromQuery;
    }
    
    // Criar manifestos para teste
    const manifest1 = `id:${manifestId};request-id:${requestIdHeader || ''};ts:${ts}`;
    const manifest2 = `id:${manifestId};request-id:${requestIdHeader || ''};ts:${ts};`;
    
    console.log('🔍 [SignatureDebug] Manifestos criados:', {
      manifest1,
      manifest2,
      manifestId,
      requestId: requestIdHeader || '',
      ts
    });
    
    // Calcular assinaturas
    const hmac1 = crypto.createHmac('sha256', secret);
    hmac1.update(manifest1);
    const calculatedSignature1 = hmac1.digest('hex');
    
    const hmac2 = crypto.createHmac('sha256', secret);
    hmac2.update(manifest2);
    const calculatedSignature2 = hmac2.digest('hex');
    
    console.log('🔍 [SignatureDebug] Assinaturas calculadas:', {
      calculatedSignature1,
      calculatedSignature2,
      receivedV1: v1
    });
    
    // Verificar correspondência
    const match1 = calculatedSignature1 === v1;
    const match2 = calculatedSignature2 === v1;
    
    console.log('🔍 [SignatureDebug] Resultados da validação:', {
      match1,
      match2,
      isValid: match1 || match2
    });
    
    return NextResponse.json({
      success: true,
      signature_validation: {
        received_signature: signatureHeader,
        parsed: { ts, v1 },
        manifest_id: manifestId,
        request_id: requestIdHeader || '',
        manifests: {
          without_semicolon: manifest1,
          with_semicolon: manifest2
        },
        calculated_signatures: {
          without_semicolon: calculatedSignature1,
          with_semicolon: calculatedSignature2
        },
        matches: {
          without_semicolon: match1,
          with_semicolon: match2
        },
        is_valid: match1 || match2,
        secret_length: secret.length,
        secret_preview: secret.substring(0, 10) + '...'
      },
      debug_info: {
        headers_received: Object.keys(headers),
        query_params: Object.fromEntries(request.nextUrl.searchParams.entries()),
        body_type: typeof body,
        body_keys: body ? Object.keys(body) : []
      }
    });
    
  } catch (error: any) {
    console.error('❌ [SignatureDebug] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook Signature Debug Endpoint',
    usage: 'POST com headers e body do webhook para debugar validação de assinatura',
    required_headers: ['x-signature', 'x-request-id'],
    timestamp: new Date().toISOString()
  });
} 