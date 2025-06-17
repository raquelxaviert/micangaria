'use client';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart, CreditCard, Truck } from 'lucide-react';
import { CartManager, CartItem } from '@/lib/cart';
import { FastImage } from '@/components/ui/FastImage';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal_centered';
import { useAuth } from '@/contexts/AuthContext';

interface ShippingOption {
  name: string;
  price: number;
  deadline: string;
  company: string;
  service: string;
  error?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const items = CartManager.getItems();
    setCartItems(items);
    
    const handleCartChange = () => {
      setCartItems(CartManager.getItems());
    };
    window.addEventListener('cartChanged', handleCartChange);
    return () => window.removeEventListener('cartChanged', handleCartChange);
  }, []);

  const removeItem = (productId: string) => {
    CartManager.removeItem(productId);
    toast({
      title: "Produto removido",
      description: "Item removido do carrinho com sucesso.",
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Redirecionar para o checkout
    router.push('/checkout');
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setZipCode(cep);
    
    if (cep.length === 8) {
      try {
        // Buscar opções de frete do Melhor Envio
        const shippingResponse = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: {
              postal_code: '01001000', // CEP da loja
            },
            to: {
              postal_code: cep,
            },
            products: cartItems.map(item => ({
              id: item.productId,
              width: 20, // Dimensões padrão para simulação
              height: 20,
              length: 20,
              weight: 1,
              insurance_value: item.price,
              quantity: item.quantity,
            })),
          }),
        });

        const shippingData = await shippingResponse.json();
        
        // Filtrar opções de frete e adicionar frete grátis para compras acima de R$ 300
        const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const options = shippingData
          .filter((option: any) => option.error === undefined) // Remover opções com erro
          .map((option: any) => ({
            name: option.name,
            price: total >= 300 ? 0 : Number(option.price) || 0,
            deadline: `${option.delivery_time} dias úteis`,
            company: option.company?.name || 'Transportadora',
            service: option.service,
            error: option.error,
          }))
          .sort((a: any, b: any) => a.price - b.price); // Ordenar por preço

        console.log('Opções de frete:', options); // Debug
        setShippingOptions(options);
        if (options.length > 0) {
          setSelectedShipping(options[0]);
        }
      } catch (error) {
        toast({
          title: 'Erro ao calcular frete',
          description: 'Não foi possível calcular o frete. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  const total = CartManager.getTotal();
  const shippingCost = selectedShipping?.price || 0;
  const finalTotal = total + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-headline text-primary">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground">
            Explore nossa coleção e adicione produtos incríveis ao seu carrinho!
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <a href="/products">
              Explorar Produtos
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-headline text-primary mb-8">Seu Carrinho</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                      <FastImage
                        src={getOptimizedImageUrl(item.imageUrl, IMAGE_CONFIGS.thumbnail)}
                        alt={item.name}
                        fill
                        className="object-cover transition-opacity duration-300"
                        quality={80}
                        priority={true}
                      />
                    </div>
                    
                    <div className="flex-grow space-y-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-xl font-bold text-primary">
                        R$ {item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Peça única
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>

                {/* Shipping Calculator */}
                <div className="space-y-2">
                  <Label htmlFor="cep">Calcular Frete</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      placeholder="Digite seu CEP"
                      value={zipCode}
                      onChange={handleCepChange}
                      maxLength={8}
                    />
                  </div>
                </div>

                {shippingOptions.length > 0 && (
                  <div className="space-y-4">
                    <Label>Opções de Entrega</Label>
                    <div className="space-y-2">
                      {shippingOptions.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            selectedShipping === option ? 'border-primary' : 'border-border'
                          }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {option.company} • {option.deadline}
                              </p>
                            </div>
                            <p className="font-medium">
                              {option.price === 0 ? (
                                <span className="text-green-600">GRÁTIS</span>
                              ) : (
                                `R$ ${option.price.toFixed(2)}`
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {total < 300 && !selectedShipping && (
                  <p className="text-xs text-muted-foreground">
                    💡 Frete grátis para compras acima de R$ 300,00
                  </p>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-3"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Finalizar Compra
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Pagamento 100% seguro via Mercado Pago
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
