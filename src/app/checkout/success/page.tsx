'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderData {
  id: string;
  status: string;
  external_reference: string;
  total_amount: number;
  created_at: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const externalRef = searchParams.get('external_ref');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!externalRef) {
      setError('Referência do pedido não encontrada');
      setLoading(false);
      return;
    }

    const checkOrderStatus = async () => {
      try {
        console.log('� Consultando status do pedido:', externalRef);
        
        // Consultar o status atual do pedido (sem alterar)
        const response = await fetch(`/api/orders/status?external_reference=${externalRef}`);
        const result = await response.json();
        
        if (result.success && result.order) {
          setOrderData(result.order);
          console.log('📋 Status do pedido:', result.order.status);
        } else {
          setError(result.error || 'Pedido não encontrado');
        }
      } catch (err) {
        console.error('❌ Erro ao consultar pedido:', err);
        setError('Erro interno');
      } finally {
        setLoading(false);
      }
    };

    checkOrderStatus();  }, [externalRef]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verificando seu pedido...</h2>
          <p className="text-gray-600">Aguarde enquanto consultamos o status</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro</h2>
          <p className="mb-4">{error}</p>
          <Link href="/" className="bg-red-600 text-white px-6 py-2 rounded">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  // Determinar o status da página baseado no status real do pedido
  const isPaid = orderData?.status === 'paid';
  const isPending = orderData?.status === 'pending';
  const isFailed = orderData?.status === 'payment_failed';
  const getStatusDisplay = () => {
    if (isPaid) return { 
      bgColor: 'bg-green-50', 
      iconBg: 'bg-green-100', 
      titleColor: 'text-green-700', 
      text: '✅ Pago', 
      message: 'Sua compra foi processada com sucesso!' 
    };
    if (isPending) return { 
      bgColor: 'bg-yellow-50', 
      iconBg: 'bg-yellow-100', 
      titleColor: 'text-yellow-700', 
      text: '⏳ Pendente', 
      message: 'Seu pagamento está sendo processado. Aguarde a confirmação.' 
    };
    if (isFailed) return { 
      bgColor: 'bg-red-50', 
      iconBg: 'bg-red-100', 
      titleColor: 'text-red-700', 
      text: '❌ Falhou', 
      message: 'Houve um problema com seu pagamento.' 
    };
    return { 
      bgColor: 'bg-gray-50', 
      iconBg: 'bg-gray-100', 
      titleColor: 'text-gray-700', 
      text: '❓ Status desconhecido', 
      message: 'Status do pedido não reconhecido.' 
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className={`min-h-screen ${statusInfo.bgColor} p-4`}>
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center mb-6">
          <div className={`w-16 h-16 ${statusInfo.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {isPaid && (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isPending && (
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isFailed && (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h1 className={`text-2xl font-bold ${statusInfo.titleColor} mb-2`}>
            {isPaid && '🎉 Pagamento Confirmado!'}
            {isPending && '⏳ Processando Pagamento'}
            {isFailed && '❌ Pagamento Não Aprovado'}
            {!isPaid && !isPending && !isFailed && '❓ Status do Pedido'}
          </h1>
          <p className="text-gray-600">{statusInfo.message}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Detalhes do Pedido</h2>
          <div className="space-y-2">
            <p><strong>Pedido:</strong> {orderData?.external_reference}</p>
            <p><strong>Status:</strong> {statusInfo.text}</p>
            {orderData?.total_amount && (
              <p><strong>Valor:</strong> R$ {(orderData.total_amount / 100).toFixed(2)}</p>
            )}
            {orderData?.created_at && (
              <p><strong>Data:</strong> {new Date(orderData.created_at).toLocaleString('pt-BR')}</p>
            )}
          </div>
          
          {isPending && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Se você pagou via PIX ou transferência, a confirmação pode demorar alguns minutos. 
                A página será atualizada automaticamente quando o pagamento for confirmado.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {isPaid && (
            <Link 
              href="/"
              className="block w-full bg-green-600 text-white text-center px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Continuar Comprando
            </Link>
          )}
          {isPending && (
            <>
              <button 
                onClick={() => window.location.reload()}
                className="block w-full bg-yellow-600 text-white text-center px-6 py-3 rounded-lg hover:bg-yellow-700"
              >
                Atualizar Status
              </button>
              <Link 
                href="/"
                className="block w-full bg-gray-600 text-white text-center px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Voltar ao Início
              </Link>
            </>
          )}
          {isFailed && (
            <>
              <Link 
                href="/checkout"
                className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Tentar Novamente
              </Link>
              <Link 
                href="/"
                className="block w-full bg-gray-600 text-white text-center px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Voltar ao Início
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
