# 🔗 CONFIGURAR WEBHOOK MERCADO PAGO

## 📋 **PASSOS OBRIGATÓRIOS**

### 1. **Configure o Webhook no Dashboard do Mercado Pago**

1. **Acesse**: https://www.mercadopago.com.br/developers/panel/app
2. **Entre na sua integração**: "RUGE BRECHO"
3. **Vá em**: Notificações → Webhooks
4. **Configure**:
   - **Modo**: Teste (para sandbox)
   - **URL**: `http://localhost:9002/api/webhooks/mercadopago`
   - **Eventos**: ✅ Pagamentos

### 2. **Para Produção (depois)**
   - **URL**: `https://rugebrecho.com/api/webhooks/mercadopago`
   - **Modo**: Produção

---

## ⚠️ **PROBLEMA ATUAL - SERVICE ROLE KEY**

Sua `SUPABASE_SERVICE_ROLE_KEY` está com placeholder. Precisa pegar a chave real:

### **Como pegar a chave:**

1. **Acesse**: https://supabase.com/dashboard/project/koduoglrfzronbcgqrjc
2. **Vá em**: Settings → API
3. **Copie**: `service_role` key (não a `anon` key)
4. **Cole no `.env.local`**:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3NzczMiwiZXhwIjoyMDY1MTUzNzMyfQ.SUA_CHAVE_REAL_AQUI
```

---

## 🧪 **TESTANDO PAGAMENTOS SANDBOX**

### **Cartões de Teste que FUNCIONAM:**

```javascript
// ✅ VISA - APROVADO
Número: 4013 4013 4013 4013
CVV: 123
Vencimento: 11/25
Nome: APRO

// ✅ MASTERCARD - APROVADO  
Número: 5031 4332 1540 6351
CVV: 123
Vencimento: 11/25
Nome: APRO

// ❌ VISA - REJEITADO (para testar rejeição)
Número: 4013 4013 4013 4013
CVV: 123
Vencimento: 11/25
Nome: OTHE
```

### **E-mails para Teste:**
- **Loja**: `test_user_285481368@testuser.com` ✅
- **Cliente**: Use qualquer e-mail **DIFERENTE** da loja

---

## 🔥 **PROBLEMAS RESOLVIDOS:**

✅ **Webhook agora salva no Supabase** (não só logs)  
✅ **Service role key** - só precisa colar a real  
✅ **E-mails de teste** - configurados  
✅ **Cartões de teste** - listados  

## 🚀 **PRÓXIMO PASSO:**

1. **Cole a service role key real** 
2. **Configure o webhook** no dashboard MP
3. **Teste um pagamento** completo

---

## 🔍 **LOGS PARA ACOMPANHAR:**

```bash
# Terminal do Next.js vai mostrar:
[WEBHOOK] Recebido do Mercado Pago: payment
[WEBHOOK] Pagamento 123456 - Status: approved  
[BANCO] ✅ Pedido atualizado com sucesso: uuid
[ETIQUETA] ✅ Etiqueta comprada com sucesso! ID: 789
```
