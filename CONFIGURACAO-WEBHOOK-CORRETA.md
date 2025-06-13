# 🔗 CONFIGURAÇÃO WEBHOOK CORRETA

## ❌ **PROBLEMA ENCONTRADO:**
URL webhook estava incorreta: `https://rugebrecho.com/api/webhooks/merc`

## ✅ **CONFIGURAÇÃO CORRETA:**

### **🧪 DESENVOLVIMENTO (Localhost):**
- **URL**: `http://localhost:9002/api/webhooks/mercadopago`
- **Modo**: Teste
- **Eventos**: ✅ Pagamentos

### **🚀 PRODUÇÃO (Vercel):**
- **URL**: `https://rugebrecho.com/api/webhooks/mercadopago`
- **Modo**: Produção  
- **Eventos**: ✅ Pagamentos

---

## 🔧 **PASSOS PARA CORRIGIR:**

### **1. No Dashboard do Mercado Pago:**
1. **Acesse**: https://www.mercadopago.com.br/developers/panel/app
2. **Sua integração**: "RUGE BRECHO"
3. **Notificações → Webhooks**
4. **MUDE URL para**: `http://localhost:9002/api/webhooks/mercadopago`
5. **Salvar configurações**

### **2. Testar novamente:**
- **Cartão**: 4013 4013 4013 4013
- **CVV**: 123
- **Vencimento**: 11/25
- **Nome**: APRO
- **E-mail**: diferente de `test_user_285481368@testuser.com`

---

## 📋 **CHECKLIST COMPLETO:**

### ✅ **Webhook configurado corretamente**
### ✅ **Service Role Key do Supabase**
### ✅ **E-mail diferente da loja**
### ✅ **Cartão APRO correto**

---

## 🔍 **LOGS ESPERADOS APÓS CORREÇÃO:**

```bash
# No terminal do Next.js:
🛒 Criando preferência de pagamento...
✅ Preferência criada: 2490474713-xxx
💾 Pedido salvo no Supabase: xxx

# Após pagamento (webhook):
[WEBHOOK] Recebido do Mercado Pago: payment
[WEBHOOK] Pagamento 123456 - Status: approved
[BANCO] ✅ Pedido atualizado com sucesso: uuid
```

---

## 🎯 **RESULTADO ESPERADO:**
1. **Pagamento aprovado** ✅
2. **Pedido muda status** para `'paid'`
3. **Webhook funciona** corretamente
4. **Sistema 100% funcional** 🚀
