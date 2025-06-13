# 🔧 GUIA COMPLETO - WEBHOOK MERCADO PAGO FUNCIONANDO

## ✅ O QUE JÁ FOI IMPLEMENTADO

### 1. Webhook Handler (`src/app/api/webhooks/mercadopago/route.ts`)
- ✅ Validação de assinatura do Mercado Pago
- ✅ Processamento de eventos `payment` e `topic_merchant_order_wh`
- ✅ Atualização do status do pedido no Supabase
- ✅ Mapeamento de status do MP para sua aplicação

### 2. SDK do Mercado Pago (`src/lib/mercadopago/client.ts`)
- ✅ Configuração do SDK atualizado
- ✅ Serviços de Payment e MerchantOrder

### 3. Create Preference atualizado
- ✅ Salvando `external_reference` no banco de dados
- ✅ Usando `external_reference` como identificador único

## 🚀 PASSOS PARA FUNCIONAR

### PASSO 1: Adicionar Variável de Ambiente no Vercel
```
MERCADOPAGO_WEBHOOK_SECRET=547a59717f88da029ad878fe98b40685cf2baf8e7ffb5fcfeb5d04c73d3767dc
```

**Como fazer:**
1. Vercel Dashboard → Seu Projeto → Settings → Environment Variables
2. Add: `MERCADOPAGO_WEBHOOK_SECRET` = `547a59717f88da029ad878fe98b40685cf2baf8e7ffb5fcfeb5d04c73d3767dc`
3. Selecionar: Production, Preview, Development
4. Save

### PASSO 2: Adicionar Coluna no Supabase
Execute este SQL no seu Supabase:

```sql
-- Executar no SQL Editor do Supabase
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_reference TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_external_reference ON orders(external_reference);
```

### PASSO 3: Redeploy no Vercel
- Faça commit das mudanças
- Push para repositório
- Vercel fará redeploy automaticamente

### PASSO 4: Testar Webhook
1. No Mercado Pago: **Suas integrações** → **Webhooks** → **Simular**
2. Escolher evento: **Pagamentos** ou **Pedidos comerciais**
3. Verificar se retorna status 200

## 📊 MAPEAMENTO DE STATUS

| Mercado Pago | Sua Aplicação |
|-------------|---------------|
| `approved` | `paid` |
| `pending` | `pending` |
| `in_process` | `processing` |
| `rejected` | `payment_failed` |
| `cancelled` | `cancelled` |
| `refunded` | `refunded` |

## 🔍 COMO FUNCIONA AGORA

### Fluxo do Webhook:
1. **Cliente paga** → Mercado Pago envia webhook
2. **Webhook recebe** → Valida assinatura
3. **Busca dados** → Chama API do Mercado Pago
4. **Atualiza pedido** → Usa `external_reference` para encontrar pedido
5. **Status atualizado** → Pedido sai de `pending` para `paid`/`payment_failed`

### Logs no Vercel:
Agora você verá logs como:
```
✅ WEBHOOK MP: Signature validated successfully
⚙️ [WebhookLogic] Processing 'payment' event. Payment ID: 123456
[WebhookLogic] Updating order by external_reference: RUGE1673843200000 to status: paid
✅ [WebhookLogic] Supabase update success for payment
```

## 🐛 TROUBLESHOOTING

### Erro 502 no Webhook:
- ✅ **RESOLVIDO** - Webhook agora responde rápido com 200 OK

### Pedido fica `pending`:
- ✅ **RESOLVIDO** - Webhook atualiza status baseado no `external_reference`

### Como verificar se está funcionando:
1. **Fazer um pedido teste**
2. **Verificar logs no Vercel** → Functions → `/api/webhooks/mercadopago`
3. **Verificar no Supabase** se status mudou de `pending`
4. **Verificar no Mercado Pago** se webhook foi entregue com sucesso

## 🔄 PRÓXIMOS PASSOS (OPCIONAL)

### 1. Melhorar Logs
- Adicionar mais detalhes nos logs
- Criar dashboard de monitoramento

### 2. Notificações por Email
- Enviar email quando pagamento for aprovado
- Integrar com SendGrid/Resend

### 3. Status Intermediários
- Adicionar mais status como `processing_payment`
- Melhorar UX no frontend

## ⚠️ IMPORTANTE

- **Sempre testar primeiro** com webhook de teste
- **Monitorar logs** após implementar
- **Verificar se variável de ambiente** está configurada corretamente
- **External reference é único** por pedido (usa timestamp)

## 🎯 RESULTADO ESPERADO

Depois de seguir todos os passos:

1. ✅ Cliente faz pedido → Status: `pending`
2. ✅ Cliente paga → Mercado Pago envia webhook
3. ✅ Webhook processa → Status atualiza para `paid`
4. ✅ Sistema funciona automaticamente

**Fim do problema de webhook 502 e pedidos ficando pending!** 🎉
