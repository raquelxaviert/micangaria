# 🚨 DIAGNÓSTICO - ERRO NO PAGAMENTO SANDBOX

## ⚠️ **PROBLEMA IDENTIFICADO:**

Você chegou até o final do checkout mas o pagamento foi rejeitado com a mensagem:
```
"Não foi possível processar seu pagamento"
```

## 🔍 **POSSÍVEIS CAUSAS:**

### **1. Problema com E-mail do Pagador**
- **❌ ERRO**: Usando mesmo e-mail da conta loja e cliente
- **✅ SOLUÇÃO**: Cliente deve usar e-mail DIFERENTE

### **2. Problema com Configuração do Payer**
- **❌ ERRO**: Dados incompletos ou inválidos do pagador
- **✅ SOLUÇÃO**: Validar CPF, telefone e endereço

### **3. Problema com External Reference**
- **❌ ERRO**: External reference muito longo ou caracteres inválidos  
- **✅ SOLUÇÃO**: Simplificar formato da referência

### **4. Webhook não configurado**
- **❌ ERRO**: Mercado Pago não consegue notificar o sistema
- **✅ SOLUÇÃO**: Configurar webhook no dashboard

---

## 🔧 **CORREÇÕES IMEDIATAS:**

### **CORREÇÃO 1: Configurar Webhook**
1. **Acesse**: https://www.mercadopago.com.br/developers/panel/app
2. **Vá em**: Notificações → Webhooks
3. **Configure**:
   - **URL**: `http://localhost:9002/api/webhooks/mercadopago`
   - **Eventos**: ✅ Pagamentos

### **CORREÇÃO 2: Usar E-mail Diferente**
```bash
# NO TESTE:
# ❌ NÃO USE: test_user_285481368@testuser.com (e-mail da loja)
# ✅ USE: cliente@teste.com (e-mail diferente)
```

### **CORREÇÃO 3: Dados do Cartão**
```bash
# ✅ CARTÃO QUE FUNCIONA:
Número: 4013 4013 4013 4013
CVV: 123
Vencimento: 11/25
Nome: APRO (IMPORTANTE: APRO = Aprovado)
```

---

## 🎯 **TESTE PASSO-A-PASSO:**

1. **Configure webhook** (link acima)
2. **Use e-mail diferente** da loja
3. **Use cartão APRO** (dados acima)
4. **Verifique logs** no terminal Next.js
5. **Teste com valor pequeno** (R$ 0,01)

---

## 📋 **LOGS ESPERADOS (terminal):**

```bash
✅ SUCESSO:
🛒 Criando preferência de pagamento...
💾 Pedido salvo no Supabase: xxx
[WEBHOOK] Recebido do Mercado Pago: payment
[WEBHOOK] Pagamento xxx - Status: approved

❌ PROBLEMA:
Sem logs de webhook = Webhook não configurado
Status: rejected = Dados inválidos
```

---

## 🚀 **DEPOIS DE CORRIGIR:**

O pagamento deve:
1. ✅ **Aprovar** no Mercado Pago
2. ✅ **Chamar webhook** automaticamente  
3. ✅ **Salvar no Supabase** como 'paid'
4. ✅ **Gerar etiqueta** no Melhor Envio

**PRINCIPAL: Configure o webhook primeiro!** 🎯
