import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';

// Configure Mercado Pago SDK with new version
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!, // Usar a variável que você já tem configurada
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Create service instances
export const paymentService = new Payment(client);
export const merchantOrderService = new MerchantOrder(client);

export { client as mercadopagoClient };

// Types for better TypeScript support
export interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference?: string;
  preference_id?: string;
  transaction_amount: number;
  date_created: string;
  date_approved?: string;
}

export interface MercadoPagoMerchantOrder {
  id: number;
  preference_id?: string;
  payments: Array<{
    id: number;
    status: string;
    status_detail: string;
    transaction_amount: number;
  }>;
  shipments?: Array<{
    id: number;
    status: string;
  }>;
}
