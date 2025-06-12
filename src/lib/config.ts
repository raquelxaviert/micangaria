// Verificação de configuração do ambiente
export function checkEnvironmentConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'MERCADO_PAGO_ACCESS_TOKEN',
    'MELHOR_ENVIO_TOKEN'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing);
    return false;
  }

  return true;
}

export function isProductionReady() {
  return checkEnvironmentConfig();
}
