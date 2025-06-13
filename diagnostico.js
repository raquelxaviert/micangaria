#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE DIAGNÓSTICO AUTOMÁTICO
 * 
 * Este script verifica todas as configurações e identifica problemas
 */

console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO...\n');

// 1. Verificar variáveis de ambiente
console.log('📋 VERIFICANDO VARIÁVEIS DE AMBIENTE:');
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configurada' : '❌ Faltando');
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Configurada' : '❌ Faltando');
console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Configurada' : '❌ Faltando');
console.log('✅ MERCADO_PAGO_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN ? '✓ Configurada' : '❌ Faltando');
console.log('✅ NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY:', process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ? '✓ Configurada' : '❌ Faltando');
console.log('✅ NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ Faltando');
console.log('✅ MERCADO_PAGO_SANDBOX:', process.env.MERCADO_PAGO_SANDBOX || '❌ Faltando');

console.log('\n📧 E-MAILS DE TESTE:');
console.log('✅ E-mail da loja:', process.env.MP_STORE_TEST_EMAIL || '❌ Faltando');

console.log('\n🔗 URLS GERADAS:');
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
console.log('✅ Base URL:', baseUrl);
console.log('✅ Webhook URL:', `${baseUrl}/api/webhooks/mercadopago`);
console.log('✅ Success URL:', `${baseUrl}/checkout/success`);
console.log('✅ Failure URL:', `${baseUrl}/checkout/failure`);

console.log('\n🎯 CONFIGURAÇÕES RECOMENDADAS:');
console.log('📧 Use e-mail diferente de:', process.env.MP_STORE_TEST_EMAIL);
console.log('💳 Cartão de teste: 4013 4013 4013 4013');
console.log('📱 CVV: 123, Vencimento: 11/25, Nome: APRO');

console.log('\n🔧 PRÓXIMOS PASSOS:');
console.log('1. Verificar se todas as variáveis estão ✓ Configuradas');
console.log('2. Configurar webhook no MP com URL:', `${baseUrl}/api/webhooks/mercadopago`);
console.log('3. Fazer teste com dados diferentes da loja');
console.log('4. Verificar logs no terminal durante o teste');

console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!\n');
