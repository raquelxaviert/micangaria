'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Star,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle,
  ChevronRight,
  Minus,
  Plus,
  Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LikeButton } from '@/components/ui/LikeButton';
import { ProductCard, ProductData } from '@/components/ui/ProductCard';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import ShippingCalculator from '@/components/ShippingCalculator';
import { CartManager } from '@/lib/ecommerce';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  gallery_urls: string[] | null;
  type: string;
  style: string;
  colors: string[];
  materials: string[];
  sizes: string[];
  is_new_arrival: boolean;
  is_on_sale: boolean;
  promotion_text: string | null;
  care_instructions: string | null;
  created_at: string;  is_active: boolean;
  slug?: string; // Slug for URL
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'materials' | 'care'>('description');
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(0);
  
  const supabase = createClient();

  // Função para pré-carregar imagens
  const preloadImage = (url: string): Promise<void> => {
    if (preloadedImages.has(url)) return Promise.resolve();
    
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, url]));
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  };

  // Pré-carregar imagens do produto e produtos relacionados
  useEffect(() => {
    const preloadAllImages = async () => {
      if (product) {
        // Pré-carregar imagens do produto atual
        const productImages = [
          product.image_url,
          ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : [])
        ].filter(Boolean);

        // Pré-carregar imagens dos produtos relacionados
        const relatedImages = relatedProducts.flatMap(p => [
          p.image_url || p.imageUrl,
          ...(Array.isArray(p.gallery_urls) ? p.gallery_urls : [])
        ]).filter(Boolean);

        // Carregar todas as imagens em paralelo, apenas URLs válidas
        await Promise.all([
          ...productImages.filter((url): url is string => !!url).map(url => preloadImage(url)),
          ...relatedImages.filter((url): url is string => !!url).map(url => preloadImage(url))
        ]);
      }
    };

    preloadAllImages();
  }, [product, relatedProducts]);
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        
        // Try to find product by slug first, then by ID
        let productData: any = null;
        let error: any = null;
        
        // First, try to find by slug
        const { data: productBySlug, error: slugError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', params.id)
          .eq('is_active', true)
          .single();

        if (productBySlug && !slugError) {
          productData = productBySlug;
        } else {
          // If not found by slug, try by ID
          const { data: productById, error: idError } = await supabase
            .from('products')
            .select('*')
            .eq('id', params.id)
            .eq('is_active', true)
            .single();
          
          productData = productById;
          error = idError;
        }

        if (error || !productData) {
          console.error('Erro ao buscar produto:', error);
          router.push('/products');
          return;
        }

        if (productData) {
          setProduct(productData);

          // Buscar produtos relacionados (mesmo tipo ou estilo)
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .neq('id', productData.id) // Use the actual product ID here
            .or(`type.eq.${productData.type},style.eq.${productData.style}`)
            .limit(4);

          if (related) {
            const convertedRelated: ProductData[] = related.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              imageUrl: p.image_url,
              image_url: p.image_url,
              gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
              type: p.type,
              style: p.style,
              colors: Array.isArray(p.colors) ? p.colors : [],
              materials: Array.isArray(p.materials) ? p.materials : [],
              sizes: Array.isArray(p.sizes) ? p.sizes : [],
              isNewArrival: p.is_new_arrival,
              isOnSale: p.is_on_sale,
              promotionDetails: p.promotion_text || undefined,
              slug: p.slug // Include slug in converted data
            }));
            setRelatedProducts(convertedRelated);
          }
        }
      } catch (error) {
        console.error('Erro ao conectar com Supabase:', error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, supabase, router]);

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      // Adicionar ao carrinho usando CartManager
      for (let i = 0; i < quantity; i++) {
        CartManager.addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image_url
        });
      }
      
      console.log('✅ Produto adicionado ao carrinho:', product.name, 'Quantidade:', quantity);
      
      // Feedback visual
      alert(`${product.name} foi adicionado ao carrinho!${quantity > 1 ? ` (${quantity}x)` : ''}`);
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
    }
  };

  const handleShippingSelect = (shippingOption: any) => {
    setSelectedShipping(shippingOption);
    setShippingCost(parseFloat(shippingOption.custom_price || shippingOption.price || '0'));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Confira este produto: ${product?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para copiar URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      } catch (error) {
        // Fallback manual
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copiado para a área de transferência!');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <Button asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos produtos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Início</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-foreground">Produtos</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8 pb-24 md:pb-8">
        {/* Botão Voltar */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">          {/* Imagens do Produto */}
          <div className="space-y-4">
            <div className="relative">
              <ImageCarousel
                images={[
                  product.image_url,
                  ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : [])
                ].filter(Boolean)}
                alt={product.name}
                showThumbnails={true}
                showZoom={true}
                className="rounded-2xl overflow-hidden"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.is_new_arrival && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">
                    NOVO
                  </Badge>
                )}
                {product.is_on_sale && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-lg">
                    {product.promotion_text || 'OFERTA'}
                  </Badge>
                )}
              </div>              {/* Botões de ação */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <LikeButton 
                  productId={product.id} 
                  variant="floating"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleShare}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div></div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">            {/* Título e Preço */}
            <div>              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {product.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {product.style}
                </Badge>
                {product.colors && product.colors.length > 0 && product.colors.map((color, index) => (
                  <Badge key={`color-${index}`} variant="outline" className="text-xs">
                    {color}
                  </Badge>
                ))}
                {product.materials && product.materials.length > 0 && product.materials.map((material, index) => (
                  <Badge key={`material-${index}`} variant="outline" className="text-xs bg-muted/50">
                    {material}
                  </Badge>
                ))}
                {product.sizes && product.sizes.length > 0 && product.sizes.map((size, index) => (
                  <Badge key={`size-${index}`} variant="outline" className="text-xs">
                    Tam. {size}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-headline text-foreground mb-4">
                {product.name}
              </h1>              <div className="text-4xl font-bold text-primary mb-2">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-sm text-muted-foreground">
                ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')} sem juros
              </p>
              
              {/* Frete Selecionado */}
              {selectedShipping && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <Truck className="w-4 h-4" />
                    <span className="font-medium text-sm">Frete Selecionado:</span>
                  </div>
                  <p className="text-sm text-green-600">
                    {selectedShipping.name} - {selectedShipping.company?.name}
                  </p>
                  <p className="text-sm text-green-600">
                    R$ {shippingCost.toFixed(2).replace('.', ',')} • {selectedShipping.delivery_time} dias úteis
                  </p>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="text-sm font-medium text-green-700">
                      Total: R$ {(product.price * quantity + shippingCost).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              )}
            </div>{/* Calculadora de Frete - Melhor Envio */}
            <div>
              <ShippingCalculator
                products={[{
                  id: product.id,
                  name: product.name,
                  type: product.type,
                  price: product.price,
                  quantity: quantity
                }]}
                onShippingSelect={handleShippingSelect}
              />
            </div>            {/* Botões de Ação */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full text-base font-semibold h-12 hidden md:flex md:items-center md:justify-center"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>

              {/* Botões secundários - Desktop */}
              <div className="hidden md:flex gap-3">                <LikeButton 
                  productId={product.id} 
                  variant="default"
                  size="lg"
                  className="flex-1 h-12"
                />
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleShare}
                  className="flex-1 h-12"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </Button>
              </div>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-base h-12 hidden md:flex md:items-center md:justify-center"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Dúvidas? Fale Conosco
              </Button>
            </div>

            {/* Informações Detalhadas */}
            <Card>
              <CardContent className="p-0">                <div className="border-b">
                  <nav className="flex">
                    {[
                      { id: 'description', label: 'Descrição' },
                      { id: 'materials', label: 'Materiais' },
                      { id: 'care', label: 'Cuidados' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="p-4">
                  {activeTab === 'description' && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}                  {activeTab === 'materials' && (
                    <div>
                      {product.materials && product.materials.length > 0 ? (
                        <div>
                          <h4 className="font-semibold mb-2">Composição:</h4>
                          <ul className="space-y-1">
                            {product.materials.map((material, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                • {material}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Informações de materiais não disponíveis.
                        </p>
                      )}
                    </div>
                  )}
                    {activeTab === 'care' && (
                    <div>
                      <h4 className="font-semibold mb-2">Cuidados Especiais:</h4>
                      {product.care_instructions ? (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {product.care_instructions}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Instruções gerais de cuidados para peças vintage:
                          </p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Lavar à mão com água fria</li>
                            <li>• Não usar alvejante</li>
                            <li>• Secar na sombra</li>
                            <li>• Guardar em local seco</li>
                            <li>• Evitar exposição prolongada ao sol</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}                </div>
              </CardContent>
            </Card>

            {/* Botão Fale Conosco - Mobile */}
            <div className="md:hidden">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-base h-12"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Dúvidas? Fale Conosco
              </Button>
            </div>
          </div>
        </div>

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-headline">
                Você Também Pode Gostar
              </h2>
              <Button variant="outline" asChild>
                <Link href="/products">
                  Ver Todos
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct) => (                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  variant="compact"
                  showRating={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>      {/* Sticky Add to Cart - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">            {/* Botão de Like - à esquerda */}
            <LikeButton 
              productId={product.id} 
              variant="default"
              size="lg"
              className="h-12 w-12 shrink-0"
            />

            {/* Botão Adicionar ao Carrinho - à direita */}
            <Button 
              size="lg" 
              className="flex-1 font-semibold h-12"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer para compensar o sticky bar no mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
