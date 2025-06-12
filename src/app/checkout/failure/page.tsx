'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, RotateCcw, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Capturar dados do pagamento da URL
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    if (paymentId) {
      setPaymentData({
        paymentId,
        status,
        externalReference
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-700">
            Pagamento Não Aprovado
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Não foi possível processar seu pagamento
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-800">Detalhes do Pagamento:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>ID do Pagamento:</strong> {paymentData.paymentId}</p>
                <p><strong>Status:</strong> <span className="text-red-600 font-medium">{paymentData.status}</span></p>
                {paymentData.externalReference && (
                  <p><strong>Pedido:</strong> {paymentData.externalReference}</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Possíveis Motivos:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Cartão sem limite disponível</li>
              <li>• Dados do cartão incorretos</li>
              <li>• Problema temporário com a operadora</li>
              <li>• Cartão bloqueado ou vencido</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <RotateCcw className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-800">Tente Novamente</h4>
                <p className="text-blue-700 text-sm">
                  Verifique os dados do cartão ou tente outro método de pagamento.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-800">PIX</h4>
                <p className="text-green-700 text-sm">
                  Experimente pagar com PIX - é mais rápido e seguro!
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 text-center space-y-3">
            <p className="text-gray-600">
              Seu carrinho foi mantido, você pode tentar novamente a qualquer momento.
            </p>
            
            <div className="flex justify-center space-x-4">
              <a 
                href="/cart" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar ao Carrinho
              </a>
              <a 
                href="/" 
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continuar Comprando
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
