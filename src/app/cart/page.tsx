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
import { CartManager, CartItem } from '@/lib/ecommerce';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setCartItems(CartManager.getCart());
    
    const handleCartChange = () => {
      setCartItems(CartManager.getCart());
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
  };const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    // Redirecionar para o novo checkout
    window.location.href = '/checkout';
  };

  const total = CartManager.getTotal();
  const shipping = total > 150 ? 0 : 15.90;
  const finalTotal = total + shipping;

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
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
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
          </div>          {/* Checkout Summary */}
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
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Frete:
                  </span>
                  <div className="text-right">
                    {shipping === 0 ? (
                      <div>
                        <span className="line-through text-muted-foreground">R$ 15,90</span>
                        <Badge className="ml-2 bg-green-100 text-green-800">GRÁTIS</Badge>
                      </div>
                    ) : (
                      <span>R$ {shipping.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    💡 Frete grátis para compras acima de R$ 150,00
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
    </div>
  );
}
