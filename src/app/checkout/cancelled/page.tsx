'use client';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { XCircle, ShoppingCart, ArrowLeft, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutCancelled() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header de Cancelamento */}
          <div className="text-center mb-8">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pagamento Cancelado
            </h1>
            <p className="text-gray-600">
              Sua compra foi cancelada. Não se preocupe, nenhuma cobrança foi realizada.
            </p>
          </div>

          {/* Informações sobre o Cancelamento */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                O que aconteceu?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600">
                O pagamento foi cancelado e você não foi cobrado. Isso pode ter acontecido por alguns motivos:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Você clicou em "Cancelar" durante o processo de pagamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Houve um problema com as informações do cartão</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>A sessão de pagamento expirou</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Você fechou a janela do navegador durante o processo</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Seus itens ainda estão salvos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Seus Itens Estão Salvos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Não se preocupe! Os itens que você selecionou ainda estão no seu carrinho. 
                Você pode tentar finalizar a compra novamente quando estiver pronto.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">💡 Dica:</h4>
                <p className="text-sm text-purple-700">
                  Certifique-se de que as informações do seu cartão estejam corretas e que 
                  você tenha uma conexão estável com a internet antes de tentar novamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formas de Pagamento */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Formas de Pagamento Aceitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Aceitamos todas as principais bandeiras de cartão:
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white border rounded-lg px-3 py-2 text-sm font-medium">
                  💳 Visa
                </div>
                <div className="bg-white border rounded-lg px-3 py-2 text-sm font-medium">
                  💳 Mastercard
                </div>
                <div className="bg-white border rounded-lg px-3 py-2 text-sm font-medium">
                  💳 American Express
                </div>
                <div className="bg-white border rounded-lg px-3 py-2 text-sm font-medium">
                  💳 Elo
                </div>
              </div>              <p className="text-sm text-gray-600 mt-4">
                Todos os pagamentos são processados com segurança através do Mercado Pago.
              </p>
            </CardContent>
          </Card>

          {/* Precisa de Ajuda */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Se você está enfrentando dificuldades com o pagamento, estamos aqui para ajudar:
              </p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">WhatsApp:</span>
                  <span>(11) 99999-9999</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>contato@micangaria.com.br</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/cart" className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Finalizar Compra
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continuar Comprando
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
