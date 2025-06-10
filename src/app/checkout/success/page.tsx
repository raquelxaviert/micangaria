'use client';

// Disable SSR for this page
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Clock, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionData {
  id: string;
  amount_total: number;
  customer_email: string;
  payment_status: string;
  metadata: {
    customerName: string;
    customerPhone: string;
  };
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Simular dados da sessão (em produção, buscar do Stripe)
      setTimeout(() => {
        const mockSessionData: SessionData = {
          id: sessionId,
          amount_total: 15900, // R$ 159,00
          customer_email: 'cliente@email.com',
          payment_status: 'paid',
          metadata: {
            customerName: 'Maria Silva',
            customerPhone: '(11) 99999-9999'
          }
        };
        setSessionData(mockSessionData);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [sessionId]);  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando seu pagamento...</p>
        </div>
      </div>
    );
  }
  if (!sessionId || !sessionData) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sessão não encontrada</h1>
          <p className="text-gray-600 mb-6">Não foi possível encontrar os dados do seu pagamento.</p>
          <Button asChild>
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header de Sucesso */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-600">
              Obrigada por sua compra! Seu pedido foi processado com sucesso.
            </p>
          </div>

          {/* Detalhes do Pedido */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Detalhes do Pedido
              </CardTitle>
              <CardDescription>
                ID da Sessão: {sessionId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Pago:</span>
                <span className="font-bold text-lg">
                  R$ {sessionData ? (sessionData.amount_total / 100).toFixed(2) : '0,00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  Pago
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span>{sessionData?.customer_email || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cliente:</span>
                <span>{sessionData?.metadata?.customerName || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Passos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">Confirmação por Email</p>
                  <p className="text-sm text-gray-600">
                    Você receberá um email de confirmação em breve com todos os detalhes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Preparação do Pedido</p>
                  <p className="text-sm text-gray-600">
                    Começaremos a preparar suas peças vintage com todo carinho.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">Entrega</p>
                  <p className="text-sm text-gray-600">
                    Você receberá o código de rastreamento assim que o pedido for enviado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Se você tiver alguma dúvida sobre seu pedido, entre em contato conosco:
              </p>              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">WhatsApp:</span>
                  <span>(11) 99999-9999</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>contato@ruge.com.br</span>
                </p>
              </div>
            </CardContent>
          </Card>          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/">
                Continuar Comprando
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/admin">
                Acessar Área Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
