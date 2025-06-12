import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateLabel } from '@/lib/melhorEnvio';

// Rota para receber notificações de webhook do Melhor Envio (Sandbox/Produção)
export async function POST(request: NextRequest) {
  const hookToken = request.headers.get('x-hook-token');
  if (hookToken !== process.env.MELHOR_ENVIO_HOOK_TOKEN) {
    console.error('🔒 Webhook token inválido:', hookToken);
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const event = await request.json();
    console.log('📩 Evento recebido do Melhor Envio:', event);

    // Extrair shipment ID e status do payload (ajuste conforme formato real)
    const shipmentId = event.id || event.shipment_id;
    const status = event.status;

    // Se for evento de criação, gerar etiqueta
    let labelData;
    if (status === 'created') {
      console.log('[Webhook MelhorEnvio] Gerando etiqueta para shipment', shipmentId);
      labelData = await generateLabel(shipmentId);
    }

    // Atualizar pedido no Supabase pelo preference_id ou shipment_id
    const updateFields: any = { shipping_status: status };
    if (labelData) {
      updateFields.shipment_id = shipmentId;
      updateFields.label_url = labelData.url || labelData.label_url;
      updateFields.tracking_code = labelData.tracking_code;
    }

    await supabaseAdmin
      .from('orders')
      .update(updateFields)
      .eq('shipment_id', shipmentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook do Melhor Envio:', error);
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
