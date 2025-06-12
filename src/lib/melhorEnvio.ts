import fetch from 'node-fetch';

const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'https://sandbox.melhorenvio.com.br/api/v2'
  : 'https://api.melhorenvio.com.br/api/v2';
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;

export interface Address {
  postal_code: string;
  address?: string;
  number?: string;
  district?: string;
  city?: string;
  state_abbr?: string;
  country_id?: string;
}

export interface Product {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value?: number;
  quantity: number;
}

export interface ShipmentOptions {
  receipt?: boolean;
  own_hand?: boolean;
  reverse?: boolean;
  non_commercial?: boolean;
  services: string;
}

export async function calculateShipping(
  from: Address,
  to: Address,
  products: Product[],
  options: ShipmentOptions
) {
  const url = `${BASE_URL}/me/shipment/calculate`;
  const payload = { from: { ...from, postal_code: from.postal_code.replace('-', '') }, to: { ...to, postal_code: to.postal_code.replace('-', '') }, products, options };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Melhor Envio erro ${res.status}: ${err}`);
  }
  return res.json();
}

/**
 * Gera etiqueta para um shipment já cadastrado
 * @param shipmentId ID do envio (order/shipment) no Melhor Envio
 */
export async function generateLabel(shipmentId: string) {
  const url = `${BASE_URL}/me/shipment/generate-label`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ shipment: shipmentId })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gerar etiqueta erro ${res.status}: ${error}`);
  }
  return res.json();
}

// Você pode adicionar aqui outras funções, como consultarEnvio, etc.
