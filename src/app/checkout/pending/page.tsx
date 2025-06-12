'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, Smartphone, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutPendingPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Clock className="w-20 h-20 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-yellow-700">
            Pagamento Pendente
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Aguardando confirmação do pagamento
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-800">Detalhes do Pagamento:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>ID do Pagamento:</strong> {paymentData.paymentId}</p>
                <p><strong>Status:</strong> <span className="text-yellow-600 font-medium">{paymentData.status}</span></p>
                {paymentData.externalReference && (
                  <p><strong>Pedido:</strong> {paymentData.externalReference}</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">O que fazer agora?</h4>
            <p className="text-blue-700 text-sm mb-3">
              Se você escolheu PIX, complete o pagamento usando o QR Code ou código que foi enviado.
            </p>
            <p className="text-blue-700 text-sm">
              Se escolheu boleto, você tem até a data de vencimento para efetuar o pagamento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <QrCode className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-800">PIX</h4>
                <p className="text-green-700 text-sm">
                  Pagamento PIX é processado em segundos. Verifique seu email para o QR Code.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <Smartphone className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-800">Notificação</h4>
                <p className="text-purple-700 text-sm">
                  Você receberá um email assim que o pagamento for confirmado.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">⏰ Importante:</h4>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• PIX: Expira em 30 minutos</li>
              <li>• Boleto: Válido por 3 dias úteis</li>
              <li>• Seu pedido só será processado após a confirmação do pagamento</li>
            </ul>
          </div>

          <div className="border-t pt-4 text-center space-y-3">
            <p className="text-gray-600">
              Acompanhe o status do seu pagamento no seu email ou banco.
            </p>
            
            <div className="flex justify-center space-x-4">
              <a 
                href="/orders" 
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Acompanhar Status
              </a>
              <a 
                href="/" 
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar para Loja
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
