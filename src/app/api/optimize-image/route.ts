import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * API Route para otimizar imagens - Download do Google Drive e Upload para Supabase
 * Esta rota roda no servidor, evitando problemas de CORS
 */

interface OptimizeImageRequest {
  googleDriveUrl: string;
  productId: string;
  fileName?: string;
}

/**
 * Extrai o ID do arquivo do Google Drive de uma URL
 */
function extractGoogleDriveId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Gera um nome único para o arquivo no Supabase
 */
function generateUniqueFileName(originalName: string, productId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `products/${productId}/${timestamp}-${random}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeImageRequest = await request.json();
    const { googleDriveUrl, productId, fileName } = body;

    console.log('🔄 Iniciando otimização de imagem:', googleDriveUrl);

    // Validar dados
    if (!googleDriveUrl || !productId) {
      return NextResponse.json(
        { success: false, error: 'URL do Google Drive e ID do produto são obrigatórios' },
        { status: 400 }
      );
    }

    // Extrair ID do Google Drive
    const driveId = extractGoogleDriveId(googleDriveUrl);
    if (!driveId) {
      return NextResponse.json(
        { success: false, error: 'URL do Google Drive inválida' },
        { status: 400 }
      );
    }

    // Tentar diferentes URLs de download do Google Drive
    const downloadUrls = [
      `https://drive.google.com/uc?export=download&id=${driveId}`,
      `https://drive.google.com/uc?id=${driveId}&export=download`,
      `https://docs.google.com/uc?export=download&id=${driveId}`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000-h2000` // Para imagens públicas
    ];

    let downloadResponse: Response | null = null;
    let downloadUrl = '';

    // Tentar cada URL até encontrar uma que funcione
    for (const url of downloadUrls) {
      try {
        console.log(`🔍 Tentando baixar de: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          downloadResponse = response;
          downloadUrl = url;
          console.log(`✅ Download bem-sucedido de: ${url}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Falha ao baixar de ${url}:`, error);
        continue;
      }
    }

    if (!downloadResponse) {
      return NextResponse.json(
        { success: false, error: 'Não foi possível baixar a imagem do Google Drive. Verifique se o link está público.' },
        { status: 400 }
      );
    }

    // Converter response para blob
    const imageBlob = await downloadResponse.blob();
    
    // Verificar se é realmente uma imagem
    if (!imageBlob.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'O arquivo baixado não é uma imagem válida' },
        { status: 400 }
      );
    }

    // Gerar nome único para o Supabase
    const supabaseFileName = generateUniqueFileName(fileName || `image-${driveId}.jpg`, productId);

    console.log(`📤 Fazendo upload para Supabase: ${supabaseFileName}`);    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-imgs')
      .upload(supabaseFileName, imageBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: imageBlob.type
      });

    if (error) {
      console.error('❌ Erro no upload para Supabase:', error);
      return NextResponse.json(
        { success: false, error: `Erro no upload: ${error.message}` },
        { status: 500 }
      );
    }    // Gerar URL pública do Supabase
    const { data: urlData } = supabase.storage
      .from('product-imgs')
      .getPublicUrl(supabaseFileName);

    console.log('✅ Imagem otimizada com sucesso:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      supabaseUrl: urlData.publicUrl,
      originalUrl: googleDriveUrl,
      downloadUrl: downloadUrl,
      fileName: supabaseFileName,
      size: imageBlob.size,
      type: imageBlob.type
    });

  } catch (error) {
    console.error('❌ Erro na otimização de imagem:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de otimização de imagens',
    usage: 'POST /api/optimize-image',
    body: {
      googleDriveUrl: 'string',
      productId: 'string',
      fileName: 'string (opcional)'
    }
  });
}
