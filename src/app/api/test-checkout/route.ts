import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'Checkout API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    message: 'API de checkout está funcionando corretamente'
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Dados recebidos corretamente',
      receivedData: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao processar dados',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 