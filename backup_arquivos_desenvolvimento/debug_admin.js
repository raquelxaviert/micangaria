// TESTE RÁPIDO - DIAGNÓSTICO ADMIN
// Execute no console do navegador (F12) na página /admin

console.log('=== DIAGNÓSTICO ADMIN ===');

// 1. Verificar localStorage
console.log('Auth localStorage:', localStorage.getItem('micangariaAdminAuth'));
console.log('Auth Time:', localStorage.getItem('micangariaAdminTime'));

// 2. Limpar autenticação se necessário
// localStorage.removeItem('micangariaAdminAuth');
// localStorage.removeItem('micangariaAdminTime');

// 3. Verificar senha correta
console.log('Senha correta: micangaria2024');

// 4. Forçar reload
// window.location.reload();

console.log('=== FIM DIAGNÓSTICO ===');
