import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar chave de serviço para bypass do RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * API Route para otimizar imagens com bypass do RLS usando service key
 */

interface OptimizeImageRequest {
  googleDriveUrl: string;
  productId: string;
  fileName?: string;
}

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

function generateUniqueFileName(originalName: string, productId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `products/${productId}/${timestamp}-${random}.${extension}`;
}

/**
 * Verifica se a URL é do Google Drive
 */
function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

/**
 * Verifica se a URL já é do Supabase Storage (já otimizada)
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/');
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeImageRequest = await request.json();
    const { googleDriveUrl, productId, fileName } = body;

    console.log('🔄 Iniciando otimização de imagem (com service key):', googleDriveUrl);

    if (!googleDriveUrl || !productId) {
      return NextResponse.json(
        { success: false, error: 'URL do Google Drive e ID do produto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já é URL do Supabase (já otimizada)
    if (isSupabaseStorageUrl(googleDriveUrl)) {
      console.log('✅ Imagem já está no Supabase, retornando URL original:', googleDriveUrl);
      return NextResponse.json({
        success: true,
        supabaseUrl: googleDriveUrl,
        originalUrl: googleDriveUrl,
        message: 'Imagem já otimizada (Supabase Storage)'
      });
    }

    // Verificar se é URL do Google Drive
    if (!isGoogleDriveUrl(googleDriveUrl)) {
      console.log('⚠️ URL não é do Google Drive, retornando URL original:', googleDriveUrl);
      return NextResponse.json({
        success: true,
        supabaseUrl: googleDriveUrl,
        originalUrl: googleDriveUrl,
        message: 'URL não é do Google Drive, mantendo como está'
      });
    }

    // Extrair ID do Google Drive
    const driveId = extractGoogleDriveId(googleDriveUrl);
    if (!driveId) {
      return NextResponse.json(
        { success: false, error: 'URL do Google Drive inválida' },
        { status: 400 }
      );
    }

    // URLs de download do Google Drive
    const downloadUrls = [
      `https://drive.google.com/uc?export=download&id=${driveId}`,
      `https://drive.google.com/uc?id=${driveId}&export=download`,
      `https://docs.google.com/uc?export=download&id=${driveId}`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000-h2000`
    ];

    let downloadResponse: Response | null = null;
    let downloadUrl = '';

    // Tentar cada URL
    for (const url of downloadUrls) {
      try {
        console.log(`🔍 Tentando baixar de: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
        { success: false, error: 'Não foi possível baixar a imagem. Verifique se o link está público.' },
        { status: 400 }
      );
    }

    const imageBlob = await downloadResponse.blob();
    
    if (!imageBlob.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'O arquivo não é uma imagem válida' },
        { status: 400 }
      );
    }

    // Gerar nome único
    const supabaseFileName = generateUniqueFileName(fileName || `image-${driveId}.jpg`, productId);

    console.log(`📤 Fazendo upload para Supabase (service key): ${supabaseFileName}`);

    // Upload usando service key (bypassa RLS)
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
    }

    // Gerar URL pública
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
    message: 'API de otimização de imagens (com service key)',
    usage: 'POST /api/optimize-image-service',
    body: {
      googleDriveUrl: 'string',
      productId: 'string',
      fileName: 'string (opcional)'
    }
  });
}
