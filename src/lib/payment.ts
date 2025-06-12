// Configuração para Mercado Pago
export const mercadoPagoConfig = {
  publicKey: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY,
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  sandbox: process.env.NODE_ENV !== 'production'
};

// Tipos para pagamento
export interface PaymentData {
  amount: number;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  identificationType?: 'CPF' | 'CNPJ';
  identificationNumber?: string;
}

export interface PaymentPreference {
  items: Array<{
    title: string;
    unit_price: number;
    quantity: number;
    description?: string;
    picture_url?: string;
  }>;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification?: {
      type: 'CPF' | 'CNPJ';
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  payment_methods: {
    excluded_payment_methods: Array<{ id: string }>;
    excluded_payment_types: Array<{ id: string }>;
    installments: number;
  };
  notification_url: string;
}

// Função para criar preferência de pagamento
export async function createPaymentPreference(data: PaymentPreference) {
  try {
    const response = await fetch('/api/payment/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar preferência de pagamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    throw error;
  }
}

// Função para processar PIX
export async function createPixPayment(data: PaymentData) {
  try {
    const response = await fetch('/api/payment/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar pagamento PIX');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar PIX:', error);
    throw error;
  }
}
