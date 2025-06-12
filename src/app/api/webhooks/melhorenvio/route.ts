import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateLabel } from '@/lib/melhorEnvio';

// Rota para receber notificações de webhook do Melhor Envio (Sandbox/Produção)
export async function POST(request: NextRequest) {
  const hookToken = request.headers.get('x-hook-token');
  const userAgent = request.headers.get('user-agent') || '';
  const contentType = request.headers.get('content-type') || '';
  
  console.log('📨 Webhook recebido:', {
    hookToken: hookToken ? 'presente' : 'ausente',
    userAgent,
    contentType
  });
  
  // Verificar se é uma requisição de teste do Melhor Envio
  const isTestRequest = userAgent.includes('MelhorEnvio') || 
                       userAgent.includes('melhorenvio') || 
                       !hookToken ||
                       hookToken === 'test';
  
  // Para produção, validar token. Para teste, permitir sem token
  if (!isTestRequest && process.env.MELHOR_ENVIO_HOOK_TOKEN && hookToken !== process.env.MELHOR_ENVIO_HOOK_TOKEN) {
    console.error('🔒 Webhook token inválido:', hookToken);
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    let event = {};
    
    // Tentar fazer parse do JSON, mas não falhar se estiver vazio
    try {
      const body = await request.text();
      if (body && body.trim()) {
        event = JSON.parse(body);
      }
    } catch (parseError) {
      console.log('📄 Request sem JSON válido (teste de conectividade)');
    }
    
    console.log('📩 Evento recebido do Melhor Envio:', event);
    
    // Se for apenas um teste de conexão, retornar sucesso
    if (isTestRequest && (!event || Object.keys(event).length === 0)) {
      console.log('✅ Teste de webhook do Melhor Envio - OK');
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook test successful',
        received_at: new Date().toISOString()
      });
    }    // Extrair shipment ID e status do payload (ajuste conforme formato real)
    const shipmentId = (event as any).id || (event as any).shipment_id;
    const status = (event as any).status;

    // Se for evento de criação, gerar etiqueta
    let labelData;
    if (status === 'created') {
      console.log('[Webhook MelhorEnvio] Gerando etiqueta para shipment', shipmentId);
      labelData = await generateLabel(shipmentId);
    }    // Atualizar pedido no Supabase pelo preference_id ou shipment_id
    const updateFields: any = { shipping_status: status };
    if (labelData) {
      updateFields.shipment_id = shipmentId;
      updateFields.label_url = labelData.url || labelData.label_url;
      updateFields.tracking_code = labelData.tracking_code;
    }

    if (supabaseAdmin) {
      await supabaseAdmin
        .from('orders')
        .update(updateFields)
        .eq('shipment_id', shipmentId);
    } else {
      console.warn('⚠️ Supabase não configurado - não foi possível atualizar pedido');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook do Melhor Envio:', error);    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

// Método GET para teste de conectividade
export async function GET(request: NextRequest) {
  console.log('🔍 Teste de conectividade do webhook Melhor Envio');
  return NextResponse.json({ 
    success: true, 
    message: 'Webhook Melhor Envio is working',
    timestamp: new Date().toISOString()
  });
}
