# 🧪 Guia Completo - Sandbox Melhor Envio

## 📋 Índice
1. [Configuração do Sandbox](#configuracao-sandbox)
2. [Como Funciona o Sandbox](#como-funciona)
3. [Simulação de Pedidos](#simulacao-pedidos)
4. [CEPs de Teste](#ceps-teste)
5. [Testes Automatizados](#testes-automatizados)
6. [Debugging](#debugging)

## 🔧 Configuração do Sandbox {#configuracao-sandbox}

### 1. URLs do Ambiente
```javascript
// Produção
const PROD_API = 'https://melhorenvio.com.br/api/v2';

// Sandbox (Desenvolvimento)
const SANDBOX_API = 'https://sandbox.melhorenvio.com.br/api/v2';
```

### 2. Token de Acesso
**Seu token atual (já configurado):**
```
MELHOR_ENVIO_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

Este token:
- ✅ É válido até 2025-04-11
- ✅ Tem todas as permissões necessárias 
- ✅ Funciona no sandbox automaticamente

## 🎯 Como Funciona o Sandbox {#como-funciona}

### Detecção Automática
```typescript
// Em shipping.ts e route.ts
const melhorEnvioConfig = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://melhorenvio.com.br/api/v2'           // Produção
    : 'https://sandbox.melhorenvio.com.br/api/v2',  // Sandbox
  token: process.env.MELHOR_ENVIO_TOKEN,
  sandbox: process.env.NODE_ENV !== 'production'    // true em dev
};
```

**Quando está em sandbox:**
- `NODE_ENV=development` (padrão no Next.js dev)
- Usa automaticamente `sandbox.melhorenvio.com.br`
- Todos os cálculos são simulados
- Não gera cobrança real

## 📦 Simulação de Pedidos {#simulacao-pedidos}

### 1. Fluxo Atual no Sistema

**Frontend (ShippingCalculator.tsx):**
```tsx
// Usuário digita CEP → Auto-valida → Calcula frete
const calculateShippingOptions = async (toAddress: any) => {
  const shippingData = {
    from: {
      postal_code: '01310100', // Av. Paulista, SP
      address: 'Avenida Paulista',
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state_abbr: 'SP',
      country_id: 'BR'
    },
    to: toAddress, // Endereço do usuário
    products: products.map(product => ({
      id: product.id,
      quantity: product.quantity,
      unitary_value: product.price,
      height: 3,    // cm
      width: 25,    // cm  
      length: 30,   // cm
      weight: 0.3   // kg
    }))
  };
  
  const options = await calculateShipping(shippingData);
  // Ordena por preço (mais barato primeiro)
  const sortedOptions = options.sort((a, b) => {
    // ... lógica de ordenação
  });
};
```

**Backend (route.ts):**
```typescript
// Requisição para Melhor Envio API
const response = await fetch(`${melhorEnvioConfig.apiUrl}/me/shipment/calculate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${melhorEnvioConfig.token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: { /* endereço loja */ },
    to: { /* endereço usuário */ },
    products: [ /* dimensões dos produtos */ ],
    options: {
      services: '1,2,3,4,7,8,9,10,11,12,17,18' // Todos os serviços
    }
  })
});
```

## 📍 CEPs de Teste Recomendados {#ceps-teste}

### CEPs que Funcionam Bem no Sandbox:

```javascript
const CEPS_TESTE = {
  // São Paulo
  'sao_paulo_centro': '01310-100',    // Av. Paulista
  'sao_paulo_zona_sul': '04038-001', // Vila Olímpia
  'sao_paulo_zona_norte': '02031-000', // Santana
  
  // Rio de Janeiro  
  'rio_centro': '20040-020',          // Centro
  'rio_copacabana': '22070-900',      // Copacabana
  
  // Belo Horizonte
  'bh_centro': '30112-000',           // Centro
  
  // Porto Alegre
  'poa_centro': '90035-001',          // Centro
  
  // Brasília
  'bsb_asa_norte': '70040-010',       // Asa Norte
  
  // Interior
  'campinas': '13010-111',            // SP
  'ribeirao_preto': '14010-100',      // SP
  'santos': '11013-560'               // SP
};
```

## 🧪 Testes Automatizados {#testes-automatizados}

### Script de Teste Completo

Vou criar um script para testar o sandbox:

```javascript
// test_sandbox_melhor_envio.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const SANDBOX_API = 'https://sandbox.melhorenvio.com.br/api/v2';
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;

const CEPS_TESTE = [
  '01310-100', // SP - Paulista
  '20040-020', // RJ - Centro  
  '30112-000', // BH - Centro
  '13010-111'  // Campinas
];

async function testarCalculoFrete(cepDestino) {
  console.log(`🧪 Testando frete para CEP: ${cepDestino}`);
  
  const requestData = {
    from: {
      postal_code: '01310100',
      address: 'Avenida Paulista',
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state_abbr: 'SP',
      country_id: 'BR'
    },
    to: {
      postal_code: cepDestino.replace('-', ''),
      country_id: 'BR'
    },
    products: [{
      id: 'test-product-1',
      width: 25,
      height: 3,
      length: 30,
      weight: 0.3,
      insurance_value: 99.90,
      quantity: 1
    }],
    options: {
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      services: '1,2,3,4,7,8,9,10,11,12,17,18'
    }
  };

  try {
    const response = await fetch(`${SANDBOX_API}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'RUGE Test (contato@ruge.com.br)'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro ${response.status}:`, errorText);
      return;
    }

    const data = await response.json();
    console.log(`✅ Sucesso! Encontradas ${Object.keys(data).length} opções:`);
    
    // Ordenar por preço
    const opcoes = Object.values(data).sort((a, b) => {
      const precoA = parseFloat(a.custom_price || a.price || 999999);
      const precoB = parseFloat(b.custom_price || b.price || 999999);
      return precoA - precoB;
    });

    opcoes.forEach((opcao, index) => {
      const preco = parseFloat(opcao.custom_price || opcao.price);
      console.log(`  ${index + 1}. ${opcao.company.name} - ${opcao.name}`);
      console.log(`     💰 R$ ${preco.toFixed(2)} | ⏱️ ${opcao.delivery_time} dias`);
    });
    
    console.log('---');
    
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error.message);
  }
}

// Executar testes
async function executarTestes() {
  console.log('🚀 Iniciando testes do Sandbox Melhor Envio\n');
  
  for (const cep of CEPS_TESTE) {
    await testarCalculoFrete(cep);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa 1s entre requests
  }
  
  console.log('✅ Testes concluídos!');
}

executarTestes();
```

## 🐛 Debugging {#debugging}

### Logs Detalhados

Para debuggar problemas, adicione logs no `route.ts`:

```typescript
// Em src/app/api/shipping/calculate/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 DEBUG - Request recebido:', {
      from: body.from?.postal_code,
      to: body.to?.postal_code,
      products: body.products?.length,
      sandbox: process.env.NODE_ENV !== 'production'
    });

    const melhorEnvioConfig = {
      apiUrl: process.env.NODE_ENV === 'production' 
        ? 'https://melhorenvio.com.br/api/v2'
        : 'https://sandbox.melhorenvio.com.br/api/v2',
      token: process.env.MELHOR_ENVIO_TOKEN
    };

    console.log('🔍 DEBUG - Configuração:', {
      apiUrl: melhorEnvioConfig.apiUrl,
      hasToken: !!melhorEnvioConfig.token,
      tokenLength: melhorEnvioConfig.token?.length
    });

    const response = await fetch(`${melhorEnvioConfig.apiUrl}/me/shipment/calculate`, {
      // ... resto da configuração
    });

    console.log('🔍 DEBUG - Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('🔍 DEBUG - Erro API:', errorData);
      // ... resto do tratamento
    }

    const data = await response.json();
    console.log('🔍 DEBUG - Opções encontradas:', Object.keys(data).length);

    // ... resto da função
  } catch (error) {
    console.error('🔍 DEBUG - Erro geral:', error);
    // ... resto do tratamento
  }
}
```

### Verificar Status do Sandbox

Script para verificar se o sandbox está funcionando:

```javascript
// check_sandbox_status.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function verificarSandbox() {
  const SANDBOX_API = 'https://sandbox.melhorenvio.com.br/api/v2';
  const TOKEN = process.env.MELHOR_ENVIO_TOKEN;

  try {
    // Teste simples - buscar informações do usuário
    const response = await fetch(`${SANDBOX_API}/me`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Sandbox funcionando!');
      console.log('👤 Usuário:', userData.firstname, userData.lastname);
      console.log('📧 Email:', userData.email);
    } else {
      console.log('❌ Problema no sandbox:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
  }
}

verificarSandbox();
```

## 📈 Próximos Passos

1. **Execute o script de teste** para verificar se tudo está funcionando
2. **Teste com diferentes CEPs** para ver variação de preços
3. **Monitore logs** no console do browser (F12) quando testar na interface
4. **Prepare para produção** quando estiver satisfeito com os testes

## 🔄 Mudança para Produção

Quando estiver pronto para produção:

```bash
# .env.local ou .env.production
NODE_ENV=production
```

Isso automaticamente mudará para:
- `https://melhorenvio.com.br/api/v2` (produção)
- Cálculos reais
- Possível cobrança por uso da API

---

**💡 Dica:** No ambiente de desenvolvimento (sandbox), você pode testar quantas vezes quiser sem custos adicionais!
