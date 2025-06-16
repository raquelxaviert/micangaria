'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Image as ImageIcon,
  RefreshCw 
} from 'lucide-react';
import { optimizeProductImages } from '@/lib/imageOptimizerFixed';

interface Product {
  id: string;
  name: string;
  image_url?: string;
  gallery_urls?: string[];
  images_optimized?: boolean;
}

interface ImageOptimizerProps {
  products: Product[];
  onOptimizationComplete: () => void;
}

interface OptimizationStatus {
  [productId: string]: {
    status: 'idle' | 'processing' | 'success' | 'error';
    message?: string;
    progress?: number;
  };
}

export function ImageOptimizer({ products, onOptimizationComplete }: ImageOptimizerProps) {
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  // Função para verificar se um produto tem imagens não otimizadas
  const hasUnoptimizedImages = (product: Product) => {
    const allImages = [
      product.image_url,
      ...(product.gallery_urls || [])
    ].filter(Boolean);
    
    // Se não tem imagens, não precisa otimizar
    if (allImages.length === 0) return false;
    
    // Se nunca foi otimizado, precisa otimizar
    if (!product.images_optimized) return true;
      // Se já foi otimizado, verificar se há imagens do Google Drive (não otimizadas)
    const hasGoogleDriveImages = allImages.some((url) => 
      url && (url.includes('drive.google.com') || url.includes('googleusercontent.com'))
    );
    
    return hasGoogleDriveImages;
  };

  // Produtos que precisam de otimização
  const productsNeedingOptimization = products.filter(hasUnoptimizedImages);
  // Produtos já otimizados completamente
  const fullyOptimizedProducts = products.filter(product => {
    const allImages = [
      product.image_url,
      ...(product.gallery_urls || [])
    ].filter(Boolean);
    
    return allImages.length > 0 && 
           product.images_optimized && 
           !hasUnoptimizedImages(product);
  });

  const optimizeSingleProduct = async (product: Product) => {
    setOptimizationStatus(prev => ({
      ...prev,
      [product.id]: { status: 'processing', progress: 0 }
    }));

    const result = await optimizeProductImages(product.id);
    
    setOptimizationStatus(prev => ({
      ...prev,
      [product.id]: {
        status: result.success ? 'success' : 'error',
        message: result.message,
        progress: 100
      }
    }));

    return result.success;
  };

  const optimizeAllProducts = async () => {
    if (productsNeedingOptimization.length === 0) return;
    
    setIsOptimizing(true);
    let successCount = 0;
    
    for (let i = 0; i < productsNeedingOptimization.length; i++) {
      const product = productsNeedingOptimization[i];
      const success = await optimizeSingleProduct(product);
      if (success) successCount++;
      
      // Pequena pausa entre otimizações para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsOptimizing(false);
    
    // Notificar componente pai para atualizar lista de produtos
    setTimeout(() => {
      onOptimizationComplete();
    }, 1000);
    
    return successCount;
  };

  const getImageCount = (product: Product) => {
    let count = 0;
    if (product.image_url) count++;
    if (product.gallery_urls) count += product.gallery_urls.length;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Otimizador de Imagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {fullyOptimizedProducts.length}
              </div>
              <div className="text-sm text-muted-foreground">Otimizados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {productsNeedingOptimization.length}
              </div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {products.reduce((acc, p) => acc + getImageCount(p), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total de Imagens</div>
            </div>
          </div>

          {productsNeedingOptimization.length > 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{productsNeedingOptimization.length} produtos</strong> precisam de otimização.
                As imagens estão sendo carregadas do Google Drive, o que pode ser lento.
              </AlertDescription>
            </Alert>
          )}

          {productsNeedingOptimization.length > 0 && (
            <Button 
              onClick={optimizeAllProducts}
              disabled={isOptimizing}
              className="w-full"
              size="lg"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Otimizar Todos os Produtos ({productsNeedingOptimization.length})
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lista de produtos pendentes */}
      {productsNeedingOptimization.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos Pendentes de Otimização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productsNeedingOptimization.map(product => {
              const status = optimizationStatus[product.id];
              const imageCount = getImageCount(product);
              
              return (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {imageCount} {imageCount === 1 ? 'imagem' : 'imagens'}
                      </div>
                      {status?.message && (
                        <div className={`text-xs mt-1 ${
                          status.status === 'error' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {status.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status?.status === 'processing' && (
                      <div className="w-24">
                        <Progress value={status.progress || 0} className="h-2" />
                      </div>
                    )}
                    
                    {status?.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    
                    {status?.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    
                    {!status && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => optimizeSingleProduct(product)}
                        disabled={isOptimizing}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Lista de produtos otimizados */}
      {fullyOptimizedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Produtos Otimizados ({fullyOptimizedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fullyOptimizedProducts.map((product: Product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getImageCount(product)} {getImageCount(product) === 1 ? 'imagem' : 'imagens'}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Rápido
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {productsNeedingOptimization.length === 0 && fullyOptimizedProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Não há produtos com imagens para otimizar no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
