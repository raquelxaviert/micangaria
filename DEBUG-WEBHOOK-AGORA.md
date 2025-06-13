# 🔍 DEBUG WEBHOOK - TESTES IMEDIATOS

## ❌ PROBLEMA IDENTIFICADO
O webhook não está sendo chamado pelo Mercado Pago. Possíveis causas:

### 1. URL INCORRETA NO PAINEL MP
- **Configurado no MP**: `https://rugebrecho.com/api/webhooks/mercadopago` 
- **Logs mostram**: `www.rugebrecho.com`
- **CORREÇÃO**: Atualize no painel MP para `https://www.rugebrecho.com/api/webhooks/mercadopago`

### 2. WEBHOOK NÃO ESTÁ ONLINE
Teste se o endpoint está funcionando:

**Teste 1: GET Request**
```bash
curl https://www.rugebrecho.com/api/webhooks/mercadopago
```

**Resultado esperado:**
```json
{
  "status": "Mercado Pago Webhook Endpoint is Online",
  "timestamp": "2025-06-13T14:10:00.000Z"
}
```

## 🚀 CORREÇÕES IMPLEMENTADAS

### 1. URL Fixa no Create Preference
- ✅ Forçado `webhookUrl = 'https://www.rugebrecho.com/api/webhooks/mercadopago'`
- ✅ Não depende mais de variáveis de ambiente

### 2. Logs Melhorados no Webhook
- ✅ Mostra URL da requisição
- ✅ Mostra todos os headers
- ✅ Debug completo

## 📋 CHECKLIST IMEDIATO

### ☐ 1. Testar Endpoint
Acesse: https://www.rugebrecho.com/api/webhooks/mercadopago
- Deve retornar JSON com status "Online"

### ☐ 2. Atualizar URL no Mercado Pago
1. Ir em **Suas integrações**
2. Selecionar sua aplicação 
3. **Webhooks** → **Configurar notificações**
4. Atualizar URL para: `https://www.rugebrecho.com/api/webhooks/mercadopago`
5. **Salvar**

### ☐ 3. Testar Simulação
1. No painel MP: **Simular**
2. Escolher evento: **Pagamentos**
3. Inserir ID fictício: `123456`
4. **Enviar teste**

### ☐ 4. Verificar nos Logs Vercel
Procurar por:
```
🔔 WEBHOOK MP: Request received.
🔗 WEBHOOK MP: Request URL: https://www.rugebrecho.com/api/webhooks/mercadopago
```

## 🎯 TESTE RÁPIDO

**Execute este comando para testar:**
```bash
# Teste GET
curl https://www.rugebrecho.com/api/webhooks/mercadopago

# Teste POST (simulação simples)
curl -X POST https://www.rugebrecho.com/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=abc123" \
  -H "x-request-id: test-123" \
  -d '{"action":"payment.updated","data":{"id":"123"},"type":"payment"}'
```

## ⚠️ IMPORTANTE

**Problema Principal**: URL do webhook no painel do Mercado Pago

- ❌ **Atual**: `https://rugebrecho.com/api/webhooks/mercadopago`
- ✅ **Correto**: `https://www.rugebrecho.com/api/webhooks/mercadopago`

**SOLUÇÃO**: Atualizar a URL no painel do Mercado Pago para incluir o "www"

## 📊 PRÓXIMOS PASSOS

1. **Atualizar URL no MP** (mais importante)
2. **Testar webhook** com simulação
3. **Fazer pedido real** para confirmar
4. **Verificar se status atualiza** no Supabase

---

**🎉 Depois disso, o webhook vai funcionar e o status será atualizado automaticamente!**
