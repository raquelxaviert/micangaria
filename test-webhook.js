/**
 * 🧪 SCRIPT DE TESTE DO WEBHOOK MERCADO PAGO COM ASSINATURA
 * 
 * Este script testa se o webhook está respondendo corretamente
 * e também testa a validação de assinatura
 */

const crypto = require('crypto');

const WEBHOOK_URL_LOCAL = 'http://localhost:9002/api/webhooks/mercadopago';
const WEBHOOK_URL_PROD = 'https://rugebrecho.com/api/webhooks/mercadopago';
const DEBUG_URL_PROD = 'https://rugebrecho.com/api/debug/signature';

// Escolher URL baseado no ambiente
const WEBHOOK_URL = process.env.NODE_ENV === 'production' ? WEBHOOK_URL_PROD : WEBHOOK_URL_LOCAL;

// Secret do webhook (deve ser o mesmo configurado no Vercel)
const WEBHOOK_SECRET = '547a59717f88da029ad878fe98b40685cf2baf8e7ffb5fcfeb5d04c73d3767dc';

function generateValidSignature(dataId, requestId, ts) {
  // Gerar manifest conforme documentação do Mercado Pago
  let manifest = '';
  if (dataId) manifest += `id:${dataId};`;
  if (requestId) manifest += `request-id:${requestId};`;
  if (ts) manifest += `ts:${ts};`;
  
  console.log('🔍 Manifest para assinatura:', manifest);
  
  // Calcular HMAC SHA256
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex');
    
  return `ts=${ts},v1=${signature}`;
}

async function testSignatureDebug() {
  console.log('🔍 Testando debug de assinatura...');
  
  const dataId = '1337611441'; // Payment ID real dos logs
  const requestId = 'test-request-' + Date.now();
  const ts = Math.floor(Date.now() / 1000); // timestamp atual
  
  const xSignature = generateValidSignature(dataId, requestId, ts);
  
  console.log('📝 Dados gerados:');
  console.log('  - data.id:', dataId);
  console.log('  - request-id:', requestId);
  console.log('  - timestamp:', ts);
  console.log('  - x-signature:', xSignature);
  
  const mockEvent = {
    id: 12345,
    live_mode: false,
    type: "payment",
    date_created: new Date().toISOString(),
    user_id: "2490474713",
    data: {
      id: dataId
    },
    action: "payment.created"
  };
  
  try {
    const response = await fetch(DEBUG_URL_PROD + `?data.id=${dataId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MercadoPago/1.0',
        'x-signature': xSignature,
        'x-request-id': requestId
      },
      body: JSON.stringify(mockEvent)
    });
    
    const data = await response.json();
    
    console.log('✅ Debug response:', JSON.stringify(data, null, 2));
    
    return response.ok;
  } catch (error) {
    console.error('❌ Erro no debug de assinatura:', error.message);
    return false;
  }
}

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
  console.log('📍 URL do debug:', DEBUG_URL_PROD);
  console.log('🔑 Secret preview:', WEBHOOK_SECRET.substring(0, 10) + '...');
  console.log('');
  
  // Testar debug de assinatura primeiro
  const signatureTest = await testSignatureDebug();
  console.log('');
  
  const getTest = await testWebhookGET();
  console.log('');
  
  const postTest = await testWebhookPOST();
  console.log('');
  
  console.log('📊 Resumo dos testes:');
  console.log('Signature Debug:', signatureTest ? '✅ Passou' : '❌ Falhou');
  console.log('GET:', getTest ? '✅ Passou' : '❌ Falhou');
  console.log('POST:', postTest ? '✅ Passou' : '❌ Falhou');
  
  if (signatureTest && getTest && postTest) {
    console.log('🎉 Todos os testes passaram! Webhook está funcionando.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

main().catch(console.error);
