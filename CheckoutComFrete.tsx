/**
 * 🛒 COMPONENTE DE CHECKOUT COM FRETE + MERCADO PAGO
 * 
 * Como funciona:
 * 1. Cliente escolhe frete
 * 2. Total = produtos + frete
 * 3. Cliente paga tudo via Mercado Pago
 * 4. Você usa parte do dinheiro para gerar etiqueta
 */

import { useState, useEffect } from 'react';

interface FreteOption {
  id: number;
  name: string;
  company: {
    name: string;
    picture: string;
  };
  price: string;
  delivery_time: number;
}

interface CheckoutComFreteProps {
  produtos: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    weight: number;
    width: number;
    height: number;
    length: number;
  }>;
  enderecoEntrega: {
    cep: string;
    cidade: string;
    estado: string;
    // ... outros campos
  };
}

export default function CheckoutComFrete({ produtos, enderecoEntrega }: CheckoutComFreteProps) {
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<FreteOption | null>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [loadingPagamento, setLoadingPagamento] = useState(false);

  // Calcular totais
  const subtotalProdutos = produtos.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const valorFrete = freteSelecionado ? parseFloat(freteSelecionado.price) : 0;
  const totalPedido = subtotalProdutos + valorFrete;

  // Calcular frete quando componente carrega
  useEffect(() => {
    calcularFrete();
  }, [enderecoEntrega.cep]);

  async function calcularFrete() {
    if (!enderecoEntrega.cep) return;
    
    setLoadingFrete(true);
    
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: {
            postal_code: '01310100', // SEU CEP da loja
            address: 'Avenida Paulista',
            number: '1000',
            district: 'Bela Vista',
            city: 'São Paulo',
            state_abbr: 'SP'
          },
          to: {
            postal_code: enderecoEntrega.cep,
            city: enderecoEntrega.cidade,
            state_abbr: enderecoEntrega.estado
          },
          products: produtos.map(p => ({
            id: p.id,
            width: p.width,
            height: p.height,
            length: p.length,
            weight: p.weight,
            insurance_value: p.price,
            quantity: p.quantity,
            unitary_value: p.price
          }))
        })
      });

      const data = await response.json();
      setFreteOptions(data.data || []);
      
      // Selecionar automaticamente o mais barato
      if (data.data && data.data.length > 0) {
        const maisBarato = data.data.reduce((prev: FreteOption, current: FreteOption) => 
          parseFloat(prev.price) < parseFloat(current.price) ? prev : current
        );
        setFreteSelecionado(maisBarato);
      }
      
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
    } finally {
      setLoadingFrete(false);
    }
  }

  async function processarPagamento() {
    if (!freteSelecionado) {
      alert('Selecione uma opção de frete');
      return;
    }

    setLoadingPagamento(true);

    try {
      // 1. Criar preferência no Mercado Pago
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            // Produtos
            ...produtos.map(produto => ({
              title: produto.name,
              quantity: produto.quantity,
              unit_price: produto.price,
              currency_id: 'BRL'
            })),
            // Frete como item separado
            {
              title: `Frete - ${freteSelecionado.name} (${freteSelecionado.company.name})`,
              quantity: 1,
              unit_price: parseFloat(freteSelecionado.price),
              currency_id: 'BRL'
            }
          ],
          metadata: {
            // Dados para gerar etiqueta depois
            shipping_service_id: freteSelecionado.id,
            shipping_service_name: freteSelecionado.name,
            shipping_price: freteSelecionado.price,
            delivery_address: enderecoEntrega,
            products: produtos
          },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/erro`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/pendente`
          },
          auto_return: 'approved'
        })
      });

      const { init_point } = await response.json();
      
      // Redirecionar para pagamento
      window.location.href = init_point;
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPagamento(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Finalizar Pedido</h2>
      
      {/* Resumo dos Produtos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Produtos</h3>
        {produtos.map(produto => (
          <div key={produto.id} className="flex justify-between items-center py-2 border-b">
            <span>{produto.name} x{produto.quantity}</span>
            <span className="font-semibold">R$ {(produto.price * produto.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center py-2 font-semibold">
          <span>Subtotal (Produtos)</span>
          <span>R$ {subtotalProdutos.toFixed(2)}</span>
        </div>
      </div>

      {/* Opções de Frete */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Escolha o Frete</h3>
        
        {loadingFrete ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Calculando opções de frete...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {freteOptions.map(opcao => (
              <label
                key={opcao.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  freteSelecionado?.id === opcao.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  type="radio"
                  name="frete"
                  value={opcao.id}
                  checked={freteSelecionado?.id === opcao.id}
                  onChange={() => setFreteSelecionado(opcao)}
                  className="sr-only"
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={opcao.company.picture}
                      alt={opcao.company.name}
                      className="w-8 h-8"
                    />
                    <div>
                      <p className="font-semibold">{opcao.name}</p>
                      <p className="text-sm text-gray-600">
                        {opcao.company.name} - {opcao.delivery_time} dias úteis
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">R$ {opcao.price}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Total do Pedido */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-lg">
          <span>Subtotal (Produtos)</span>
          <span>R$ {subtotalProdutos.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span>Frete</span>
          <span>R$ {valorFrete.toFixed(2)}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between items-center text-xl font-bold">
          <span>TOTAL</span>
          <span className="text-green-600">R$ {totalPedido.toFixed(2)}</span>
        </div>
      </div>

      {/* Informação importante */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💰 Como funciona o pagamento:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Você paga R$ {totalPedido.toFixed(2)} via Mercado Pago</li>
          <li>• R$ {subtotalProdutos.toFixed(2)} pelos produtos</li>
          <li>• R$ {valorFrete.toFixed(2)} pelo frete ({freteSelecionado?.name})</li>
          <li>• Após aprovação, geraremos sua etiqueta automaticamente</li>
        </ul>
      </div>

      {/* Botão de Pagamento */}
      <button
        onClick={processarPagamento}
        disabled={!freteSelecionado || loadingPagamento}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loadingPagamento ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processando...
          </div>
        ) : (
          `Pagar R$ ${totalPedido.toFixed(2)} via Mercado Pago`
        )}
      </button>

      {/* Métodos de pagamento aceitos */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>💳 Cartão de crédito, débito, PIX, boleto</p>
        <p>🔒 Pagamento 100% seguro via Mercado Pago</p>
      </div>
    </div>
  );
}
