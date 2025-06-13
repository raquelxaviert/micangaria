'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const externalRef = searchParams.get('external_ref');
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!externalRef) {
      setError('Referência do pedido não encontrada');
      setProcessing(false);
      return;
    }

    const updateOrder = async () => {
      try {
        console.log('🔄 Atualizando pedido:', externalRef);
        
        const response = await fetch('/api/checkout/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            external_reference: externalRef,
            status: 'paid'
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.error || 'Erro ao atualizar pedido');
        }
      } catch (err) {
        setError('Erro interno');
      } finally {
        setProcessing(false);
      }
    };

    updateOrder();
  }, [externalRef]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processando pagamento...</h2>
          <p className="text-gray-600">Aguarde enquanto confirmamos sua compra</p>
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

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            🎉 Pagamento Confirmado!
          </h1>
          <p className="text-gray-600">Sua compra foi processada com sucesso</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
          <p><strong>Pedido:</strong> {externalRef}</p>
          <p><strong>Status:</strong> ✅ Pago</p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full bg-green-600 text-white text-center px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Continuar Comprando
          </Link>
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
