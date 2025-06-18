import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const testUrl = searchParams.get('url');

    if (testUrl) {
      // Testar performance de uma URL específica
      const startTime = Date.now();
      
      try {
        const response = await fetch(testUrl, {
          method: 'HEAD', // Apenas headers para ser mais rápido
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        return NextResponse.json({
          success: true,
          url: testUrl,
          responseTime: `${responseTime}ms`,
          status: response.status,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
          cacheControl: response.headers.get('cache-control'),
          isSupabase: testUrl.includes('supabase.co'),
          isGoogleDrive: testUrl.includes('drive.google.com')
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          url: testUrl,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          responseTime: `${Date.now() - startTime}ms`
        });
      }
    }

    if (productId) {
      // Analisar um produto específico
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, image_url, gallery_urls, images_optimized')
        .eq('id', productId)
        .single();

      if (error || !product) {
        return NextResponse.json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      const allImages = [
        product.image_url,
        ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : [])
      ].filter(Boolean);

      const imageAnalysis = await Promise.all(
        allImages.map(async (url, index) => {
          const startTime = Date.now();
          try {
            const response = await fetch(url, { method: 'HEAD' });
            const responseTime = Date.now() - startTime;
            
            return {
              index,
              url,
              responseTime: `${responseTime}ms`,
              status: response.status,
              contentType: response.headers.get('content-type'),
              contentLength: response.headers.get('content-length'),
              isSupabase: url.includes('supabase.co'),
              isGoogleDrive: url.includes('drive.google.com'),
              success: response.ok
            };
          } catch (error) {
            return {
              index,
              url,
              responseTime: `${Date.now() - startTime}ms`,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              success: false
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        product: {
          id: product.id,
          name: product.name,
          images_optimized: product.images_optimized,
          totalImages: allImages.length
        },
        imageAnalysis,
        summary: {
          supabaseImages: imageAnalysis.filter(img => img.isSupabase).length,
          googleDriveImages: imageAnalysis.filter(img => img.isGoogleDrive).length,
          averageResponseTime: imageAnalysis.reduce((acc, img) => {
            const time = parseInt(img.responseTime.replace('ms', ''));
            return acc + (isNaN(time) ? 0 : time);
          }, 0) / imageAnalysis.length,
          failedImages: imageAnalysis.filter(img => !img.success).length
        }
      });
    }

    // Análise geral dos produtos
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, image_url, gallery_urls, images_optimized')
      .limit(10);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }

    const analysis = products.map(product => {
      const allImages = [
        product.image_url,
        ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : [])
      ].filter(Boolean);

      const supabaseImages = allImages.filter(url => url.includes('supabase.co')).length;
      const googleDriveImages = allImages.filter(url => url.includes('drive.google.com')).length;

      return {
        id: product.id,
        name: product.name,
        images_optimized: product.images_optimized,
        totalImages: allImages.length,
        supabaseImages,
        googleDriveImages,
        optimizationStatus: product.images_optimized ? 'Otimizado' : 'Não otimizado'
      };
    });

    return NextResponse.json({
      success: true,
      analysis,
      summary: {
        totalProducts: products.length,
        optimizedProducts: products.filter(p => p.images_optimized).length,
        totalImages: products.reduce((acc, p) => {
          const images = [p.image_url, ...(Array.isArray(p.gallery_urls) ? p.gallery_urls : [])].filter(Boolean);
          return acc + images.length;
        }, 0),
        supabaseImages: products.reduce((acc, p) => {
          const images = [p.image_url, ...(Array.isArray(p.gallery_urls) ? p.gallery_urls : [])].filter(Boolean);
          return acc + images.filter(url => url.includes('supabase.co')).length;
        }, 0),
        googleDriveImages: products.reduce((acc, p) => {
          const images = [p.image_url, ...(Array.isArray(p.gallery_urls) ? p.gallery_urls : [])].filter(Boolean);
          return acc + images.filter(url => url.includes('drive.google.com')).length;
        }, 0)
      }
    });

  } catch (error) {
    console.error('Erro no diagnóstico de imagens:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
} 