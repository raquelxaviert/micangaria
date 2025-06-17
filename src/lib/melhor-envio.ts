export const melhorEnvioConfig = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://www.melhorenvio.com.br/api/v2'
    : 'https://sandbox.melhorenvio.com.br/api/v2',
  token: process.env.MELHOR_ENVIO_TOKEN,
  clientId: process.env.MELHOR_ENVIO_CLIENT_ID,
  clientSecret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
  redirectUri: process.env.MELHOR_ENVIO_REDIRECT_URI,
  sandbox: process.env.NODE_ENV !== 'production',
}; 