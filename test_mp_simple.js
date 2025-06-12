require('dotenv').config({ path: '.env.local' });

console.log('🔧 TESTE DE CONFIGURAÇÃO MERCADO PAGO');
console.log('==========================================');

console.log('📊 VARIÁVEIS DE AMBIENTE:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MERCADO_PAGO_SANDBOX:', process.env.MERCADO_PAGO_SANDBOX);
console.log('ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 20) + '...');

console.log('\n🎯 CONFIGURAÇÃO DETECTADA:');
const isProduction = process.env.NODE_ENV === 'production';
const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true' || !isProduction;

console.log('isProduction:', isProduction);
console.log('isSandbox:', isSandbox);

const testEmail = 'test_user_297518619@testuser.com';
console.log('Email que será usado:', isSandbox ? testEmail : 'email do cliente');

if (isSandbox && process.env.MERCADO_PAGO_ACCESS_TOKEN?.includes('APP_USR')) {
  console.log('\n🎉 TUDO CONFIGURADO CORRETAMENTE!');
} else {
  console.log('\n⚠️ PROBLEMA NA CONFIGURAÇÃO!');
}
