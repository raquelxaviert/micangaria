import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 WEBHOOK: Recebido');
    
    // Sempre retorna 200 primeiro
    const response = NextResponse.json({ 
      received: true, 
      timestamp: new Date().toISOString() 
    });
    
    // Depois tenta processar
    try {
      const body = await request.json();
      console.log('📥 WEBHOOK Body:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.log('⚠️ WEBHOOK: Erro ao ler body, mas continuando...');
    }
    
    return response;
  } catch (error) {
    console.log('❌ WEBHOOK: Erro geral, mas retornando 200');
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook Online', 
    timestamp: new Date().toISOString() 
  });
}
