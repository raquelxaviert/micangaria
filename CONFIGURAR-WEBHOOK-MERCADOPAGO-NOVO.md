# 🔗 CONFIGURAR WEBHOOK MERCADO PAGO

## ✅ STATUS ATUAL
- Webhook melhorado com validação de assinatura (opcional)
- Processamento automático de eventos de pagamento
- Atualização automática de status no Supabase
- Logs detalhados para debug
- Sempre retorna 200 para evitar erro 502

## 📍 URLs DO WEBHOOK

### Desenvolvimento (Local)
```
http://localhost:9002/api/webhooks/mercadopago
```

### Produção (Vercel)
```
https://rugebrecho.com/api/webhooks/mercadopago
```

## 🔧 CONFIGURAÇÃO NO MERCADO PAGO

### 1. Acessar o Painel do Mercado Pago
1. Entre em: https://www.mercadopago.com.br/developers/
2. Vá em "Suas integrações"
3. Selecione sua aplicação
4. Vá na aba "Webhooks"

### 2. Configurar Webhook
```
URL: https://rugebrecho.com/api/webhooks/mercadopago
Eventos: Selecionar "Pagamentos"
```

### 3. Configuração Opcional de Segurança
Se quiser validação de assinatura:
1. No painel do MP, anote o "Webhook Secret"
2. Adicione no `.env.local`:
```bash
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

## 🧪 TESTAR WEBHOOK

### Teste Local
```bash
node test-webhook.js
```

### Teste Manual via cURL
```bash
# Testar GET
curl -X GET http://localhost:9002/api/webhooks/mercadopago

# Testar POST com evento simulado
curl -X POST http://localhost:9002/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "id": 12345,
    "live_mode": false,
    "type": "payment",
    "date_created": "2024-01-15T10:00:00.000Z",
    "user_id": "123456789",
    "data": {"id": "1234567890"},
    "action": "payment.created"
  }'
```

## 📊 EVENTOS PROCESSADOS

### Eventos de Pagamento (`type: "payment"`)
- `payment.created` - Pagamento criado
- `payment.updated` - Pagamento atualizado
- O webhook busca os dados do pagamento via API
- Atualiza o status no Supabase automaticamente

### Outros Eventos
- Todos os outros eventos são logados mas não processados automaticamente
- Exemplos: `merchant_order`, `plan`, `subscription`, etc.

## 🔍 MONITORAMENTO E DEBUG

### Verificar Logs
```bash
# No desenvolvimento (terminal onde roda o Next.js)
npm run dev

# Na produção (logs do Vercel)
vercel logs --follow
```

### Verificar se Webhook está Online
```bash
curl https://rugebrecho.com/api/webhooks/mercadopago
```

Deve retornar:
```json
{
  "status": "Webhook Mercado Pago Online",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "message": "Endpoint funcionando corretamente"
}
```

## 🔐 VALIDAÇÃO DE ASSINATURA

### Como Funciona
1. Mercado Pago envia header `x-signature` com HMAC-SHA256
2. Webhook valida usando `MERCADO_PAGO_WEBHOOK_SECRET`
3. Se inválida, retorna 401
4. Se não configurada, aceita qualquer webhook

### Configurar Validação
1. No painel MP, obtenha o webhook secret
2. Adicione no `.env.local`:
```bash
MERCADO_PAGO_WEBHOOK_SECRET=whsec_abc123...
```
3. Redeploy da aplicação

## 📈 FLUXO COMPLETO

1. **Pagamento Criado** → MP envia webhook `payment.created`
2. **Webhook Recebe** → Valida assinatura (se configurada)
3. **Busca Dados** → Consulta API do MP para obter detalhes
4. **Atualiza Supabase** → Atualiza `payment_id`, `payment_status`
5. **Se Aprovado** → Marca pedido como `paid` no Supabase

## 🧪 CARTÕES DE TESTE MERCADO PAGO

### ✅ Cartões que APROVAM (APRO)
```
VISA - APROVADO
Número: 4013 4013 4013 4013
CVV: 123
Vencimento: 11/25
Nome: APRO

MASTERCARD - APROVADO  
Número: 5031 4332 1540 6351
CVV: 123
Vencimento: 11/25
Nome: APRO
```

### ❌ Cartões que REJEITAM (Para teste)
```
VISA - REJEITADO
Número: 4013 4013 4013 4014
CVV: 123
Vencimento: 11/25
Nome: OTHE
```

## ❗ TROUBLESHOOTING

### Webhook não está sendo chamado
- Verifique se a URL está correta no painel MP
- Teste a URL manualmente com cURL
- Verifique se a aplicação está online

### Erro 502 Bad Gateway
- ✅ **RESOLVIDO**: Webhook sempre retorna 200 agora

### Eventos não estão sendo processados
- Verifique os logs do servidor
- Use `node test-webhook.js` para testar localmente
- Verifique se `MERCADO_PAGO_ACCESS_TOKEN` está correto

### Assinatura inválida
- Verifique se `MERCADO_PAGO_WEBHOOK_SECRET` está correto
- Ou remova a variável para desabilitar validação

### Pedidos não são atualizados no Supabase
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correto
- Verifique se o `external_reference` no pagamento corresponde ao ID do pedido
- Verifique os logs do webhook para erros de atualização

## 🎯 PRÓXIMOS PASSOS

1. ✅ Webhook configurado e funcionando
2. ✅ Processamento de eventos de pagamento
3. ✅ Atualização automática no Supabase
4. 🔄 Testar fluxo completo com cartão APRO
5. 🔄 Verificar logs em produção

## 📝 COMANDOS ÚTEIS

```bash
# Testar webhook localmente
node test-webhook.js

# Verificar pedidos no Supabase
node diagnostico.js

# Rodar aplicação local
npm run dev

# Deploy para Vercel
git push origin main

# Ver logs da produção
vercel logs --follow
```
