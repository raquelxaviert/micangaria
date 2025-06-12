/**
 * 🧪 Script para testar configuração do Mercado Pago
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔧 TESTE DE CONFIGURAÇÃO MERCADO PAGO');
console.log('==========================================');

console.log('📊 VARIÁVEIS DE AMBIENTE:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MERCADO_PAGO_SANDBOX:', process.env.MERCADO_PAGO_SANDBOX);
console.log('ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 20) + '...');
console.log('PUBLIC_KEY:', process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.substring(0, 20) + '...');

console.log('\n🎯 CONFIGURAÇÃO DETECTADA:');
const isProduction = process.env.NODE_ENV === 'production';
const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true' || !isProduction;

console.log('isProduction:', isProduction);
console.log('isSandbox:', isSandbox);

const testEmail = 'test_user_297518619@testuser.com';
console.log('Email que será usado:', isSandbox ? testEmail : 'email do cliente');

console.log('\n✅ CONFIGURAÇÃO CORRETA:', {
  sandbox: isSandbox,
  testEmail: testEmail,
  tokenIsTest: process.env.MERCADO_PAGO_ACCESS_TOKEN?.includes('APP_USR'),
  readyForTesting: isSandbox && process.env.MERCADO_PAGO_ACCESS_TOKEN?.includes('APP_USR')
});

if (isSandbox && process.env.MERCADO_PAGO_ACCESS_TOKEN?.includes('APP_USR')) {
  console.log('\n🎉 TUDO CONFIGURADO CORRETAMENTE PARA TESTES!');
  console.log('👤 Use o email: test_user_297518619@testuser.com');
  console.log('🔢 Use o CPF: 12345678901');
} else {
  console.log('\n⚠️ CONFIGURAÇÃO INCORRETA!');
}
