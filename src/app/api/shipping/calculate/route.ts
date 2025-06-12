import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: any;
  
  try {
    body = await request.json();
    
    // Configuração do Melhor Envio
    const melhorEnvioConfig = {
      apiUrl: process.env.NODE_ENV === 'production' 
        ? 'https://melhorenvio.com.br/api/v2'
        : 'https://sandbox.melhorenvio.com.br/api/v2',
      token: process.env.MELHOR_ENVIO_TOKEN
    };

    // Dados da requisição para o Melhor Envio
    const requestData = {
      from: {
        postal_code: body.from.postal_code,
        address: body.from.address,
        number: body.from.number || 'S/N',
        complement: body.from.complement || '',
        district: body.from.district,
        city: body.from.city,
        state_abbr: body.from.state_abbr,
        country_id: body.from.country_id || 'BR'
      },
      to: {
        postal_code: body.to.postal_code,
        address: body.to.address || '',
        number: body.to.number || 'S/N',
        complement: body.to.complement || '',
        district: body.to.district || '',
        city: body.to.city || '',
        state_abbr: body.to.state_abbr || '',
        country_id: body.to.country_id || 'BR'
      },
      products: body.products,
      options: {
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        insurance_value: body.products.reduce((sum: number, p: any) => sum + (p.unitary_value * p.quantity), 0),
        services: '1,2,3,4,7,8,9,10,11,12,17,18' // IDs dos serviços do Melhor Envio
      }
    };

    // Fazer requisição para a API do Melhor Envio
    const response = await fetch(`${melhorEnvioConfig.apiUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${melhorEnvioConfig.token}`,
        'User-Agent': 'RUGE Vintage Store (contato@ruge.com.br)'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro API Melhor Envio:', errorData);
      
      // Se não conseguir usar o Melhor Envio, calcular frete básico dos Correios
      return NextResponse.json({
        data: await calculateBasicShipping(body.from, body.to, body.products)
      });
    }

    const data = await response.json();
    
    // Filtrar e formatar os resultados
    const formattedResults = Object.values(data).map((option: any) => ({
      id: option.id,
      name: option.name,
      company: {
        id: option.company?.id || 0,
        name: option.company?.name || 'Transportadora',
        picture: option.company?.picture || '/default-shipping.png'
      },
      price: option.price,
      custom_price: option.custom_price || option.price,
      discount: option.discount || '0',
      currency: option.currency || 'BRL',
      delivery_time: option.delivery_time || 5,
      delivery_range: option.delivery_range || { min: 3, max: 7 },
      custom_delivery_time: option.custom_delivery_time || option.delivery_time,
      custom_delivery_range: option.custom_delivery_range || option.delivery_range,
      packages: option.packages || [],
      additional_services: {
        receipt: false,
        own_hand: false,
        collect: false
      }
    }));

    return NextResponse.json({
      data: formattedResults
    });
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    
    // Fallback: retornar opções básicas de frete
    const fallbackOptions = await calculateBasicShipping(
      body?.from || { postal_code: '01310100' },
      body?.to || { postal_code: '00000000' },
      body?.products || []
    );
    
    return NextResponse.json({
      data: fallbackOptions
    });
  }
}

// Função fallback para calcular frete básico
async function calculateBasicShipping(from: any, to: any, products: any[]) {
  const totalWeight = products.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
  const totalValue = products.reduce((sum, p) => sum + (p.unitary_value * p.quantity), 0);
  
  // Cálculo básico baseado no peso e distância (simulado)
  const basePrice = Math.max(15, totalWeight * 5 + (totalValue * 0.02));
  
  return [
    {
      id: 1,
      name: 'Correios PAC',
      company: {
        id: 1,
        name: 'Correios',
        picture: 'https://static.melhorenvio.com.br/images/shipping-companies/correios.png'
      },
      price: (basePrice * 1.2).toFixed(2),
      custom_price: (basePrice * 1.2).toFixed(2),
      discount: '0',
      currency: 'BRL',
      delivery_time: 8,
      delivery_range: { min: 6, max: 10 },
      custom_delivery_time: 8,
      custom_delivery_range: { min: 6, max: 10 },
      packages: [],
      additional_services: {
        receipt: false,
        own_hand: false,
        collect: false
      }
    },
    {
      id: 2,
      name: 'Correios SEDEX',
      company: {
        id: 1,
        name: 'Correios',
        picture: 'https://static.melhorenvio.com.br/images/shipping-companies/correios.png'
      },
      price: (basePrice * 1.8).toFixed(2),
      custom_price: (basePrice * 1.8).toFixed(2),
      discount: '0',
      currency: 'BRL',
      delivery_time: 3,
      delivery_range: { min: 2, max: 4 },
      custom_delivery_time: 3,
      custom_delivery_range: { min: 2, max: 4 },
      packages: [],
      additional_services: {
        receipt: false,
        own_hand: false,
        collect: false
      }
    }
  ];
}
