// Configuração do Melhor Envio
export const melhorEnvioConfig = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://melhorenvio.com.br/api/v2'
    : 'https://sandbox.melhorenvio.com.br/api/v2',
  token: process.env.MELHOR_ENVIO_TOKEN,
  sandbox: process.env.NODE_ENV !== 'production'
};

// Tipos para frete
export interface ShippingAddress {
  postal_code: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state_abbr?: string;
  country_id?: string;
}

export interface ProductDimensions {
  height: number; // cm
  width: number;  // cm
  length: number; // cm
  weight: number; // kg
}

export interface ShippingCalculation {
  from: ShippingAddress;
  to: ShippingAddress;
  products: Array<ProductDimensions & {
    id: string;
    quantity: number;
    unitary_value: number;
  }>;
}

export interface ShippingOption {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  custom_delivery_time: number;
  custom_delivery_range: {
    min: number;
    max: number;
  };
  packages: Array<{
    price: string;
    discount: string;
    format: string;
    dimensions: {
      height: number;
      width: number;
      length: number;
    };
    weight: string;
    insurance_value: string;
  }>;
  additional_services: {
    receipt: boolean;
    own_hand: boolean;
    collect: boolean;
  };
}

// Função para calcular frete
export async function calculateShipping(data: ShippingCalculation): Promise<ShippingOption[]> {
  try {
    const response = await fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao calcular frete');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    throw error;
  }
}

// Função para validar CEP
export async function validateZipCode(zipCode: string): Promise<ShippingAddress | null> {
  try {
    // Remove formatação do CEP
    const cleanZip = zipCode.replace(/\D/g, '');
    
    if (cleanZip.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao consultar CEP');
    }

    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      postal_code: cleanZip,
      address: data.logradouro,
      district: data.bairro,
      city: data.localidade,
      state_abbr: data.uf,
      country_id: 'BR'
    };
  } catch (error) {
    console.error('Erro ao validar CEP:', error);
    return null;
  }
}

// Função utilitária para formatar CEP
export function formatZipCode(zipCode: string): string {
  const clean = zipCode.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Função para estimar dimensões baseado no tipo de produto
export function estimateProductDimensions(productType: string): ProductDimensions {
  const dimensions: Record<string, ProductDimensions> = {
    'vestido': { height: 3, width: 30, length: 40, weight: 0.3 },
    'blusa': { height: 2, width: 25, length: 35, weight: 0.2 },
    'calca': { height: 3, width: 25, length: 35, weight: 0.4 },
    'saia': { height: 2, width: 25, length: 30, weight: 0.25 },
    'jaqueta': { height: 4, width: 35, length: 45, weight: 0.6 },
    'acessorio': { height: 5, width: 15, length: 20, weight: 0.1 },
    'sapato': { height: 10, width: 15, length: 30, weight: 0.5 },
    'bolsa': { height: 15, width: 25, length: 35, weight: 0.4 },
    'default': { height: 3, width: 25, length: 30, weight: 0.3 }
  };

  return dimensions[productType.toLowerCase()] || dimensions['default'];
}
