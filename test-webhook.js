/**
 * 🧪 SCRIPT DE TESTE DO WEBHOOK MERCADO PAGO
 * 
 * Este script testa se o webhook está respondendo corretamente
 * tanto para requisições GET quanto POST
 */

const WEBHOOK_URL_LOCAL = 'http://localhost:9002/api/webhooks/mercadopago';
const WEBHOOK_URL_PROD = 'https://rugebrecho.com/api/webhooks/mercadopago';

// Escolher URL baseado no ambiente
const WEBHOOK_URL = process.env.NODE_ENV === 'production' ? WEBHOOK_URL_PROD : WEBHOOK_URL_LOCAL;

async function testWebhookGET() {
  console.log('🔍 Testando GET no webhook...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    console.log('✅ GET Webhook funcionando:', {
      status: response.status,
      data
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Erro no GET Webhook:', error.message);
    return false;
  }
}

async function testWebhookPOST() {
  console.log('🔍 Testando POST no webhook com evento simulado...');
  
  // Evento simulado do Mercado Pago
  const mockEvent = {
    id: 12345,
    live_mode: false,
    type: "payment",
    date_created: new Date().toISOString(),
    user_id: "123456789",
    data: {
      id: "1234567890"
    },
    action: "payment.created"
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MercadoPago/1.0'
      },
      body: JSON.stringify(mockEvent)
    });
    
    const data = await response.json();
    
    console.log('✅ POST Webhook funcionando:', {
      status: response.status,
      data
    });
    
    return response.ok;
  } catch (error) {
    console.error('❌ Erro no POST Webhook:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando testes do webhook...');
  console.log('📍 URL do webhook:', WEBHOOK_URL);
  console.log('');
  
  const getTest = await testWebhookGET();
  console.log('');
  
  const postTest = await testWebhookPOST();
  console.log('');
  
  console.log('📊 Resumo dos testes:');
  console.log('GET:', getTest ? '✅ Passou' : '❌ Falhou');
  console.log('POST:', postTest ? '✅ Passou' : '❌ Falhou');
  
  if (getTest && postTest) {
    console.log('🎉 Todos os testes passaram! Webhook está funcionando.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

main().catch(console.error);
