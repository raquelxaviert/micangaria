# Configuração de Variáveis de Ambiente - Mercado Pago Webhook

## Variável de Ambiente para Adicionar no Vercel

Adicione esta variável de ambiente no seu projeto Vercel:

### MERCADOPAGO_WEBHOOK_SECRET
```
MERCADOPAGO_WEBHOOK_SECRET=547a59717f88da029ad878fe98b40685cf2baf8e7ffb5fcfeb5d04c73d3767dc
```

## Como Adicionar no Vercel:

1. Acesse o dashboard do Vercel
2. Vá para o seu projeto
3. Clique em "Settings"
4. Clique em "Environment Variables" 
5. Adicione:
   - **Name**: `MERCADOPAGO_WEBHOOK_SECRET`
   - **Value**: `547a59717f88da029ad878fe98b40685cf2baf8e7ffb5fcfeb5d04c73d3767dc`
   - **Environment**: Selecione todas (Production, Preview, Development)

6. Clique em "Save"

## Redeploy

Após adicionar a variável, faça um redeploy do projeto para que as mudanças tenham efeito.

## Verificação

Você pode testar se está funcionando fazendo uma simulação de webhook no painel do Mercado Pago:
- Suas integrações > Webhook > Simular

## Status dos Pedidos Mapeados

O webhook agora mapeia os status do Mercado Pago para:
- `approved` → `paid`
- `pending` → `pending`
- `in_process` → `processing`
- `rejected` → `payment_failed`
- `cancelled` → `cancelled`
- `refunded` → `refunded`

## Eventos Configurados

O webhook processa:
- ✅ **Pagamentos** (type: 'payment')
- ✅ **Pedidos comerciais** (type: 'topic_merchant_order_wh')
- ✅ **Vinculação de aplicações**
- ✅ **Alertas de fraude**
- ✅ **Reclamações**
- ✅ **Contestações**
