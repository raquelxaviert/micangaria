# 🎯 TESTE SIMPLIFICADO PARA RESOLVER O PROBLEMA

## ❌ **PROBLEMAS IDENTIFICADOS NO SUPABASE:**

1. **`user_id` vazio** → Corrigido (agora usa email como fallback)
2. **Webhook nunca chamado** → Status sempre `'pending'`
3. **Campos `customer_info` e `shipping_address` faltando** → Adicionados

## 🔧 **CORREÇÕES APLICADAS:**

### ✅ **1. API de criação corrigida:**
- `user_id` agora usa `customerInfo.email` como fallback
- Adicionados campos `customer_info` e `shipping_address`
- Melhor tratamento de erros

### ✅ **2. SQL para adicionar campos:**
Execute no Supabase SQL Editor: `sql/add_missing_fields.sql`

## 🧪 **TESTE PASSO A PASSO:**

### **1. Execute o SQL no Supabase:**
```sql
-- Cole e execute o conteúdo de: sql/add_missing_fields.sql
```

### **2. Teste com dados específicos:**
- **E-mail**: `teste.funcionamento@gmail.com` (DIFERENTE da loja)
- **Nome**: `Teste Cliente`
- **Cartão**: `4013 4013 4013 4013`
- **CVV**: `123`
- **Vencimento**: `11/25`
- **Nome no cartão**: `APRO`

### **3. Verifique os logs:**
```bash
# Deve aparecer no terminal:
💾 Salvando pedido no Supabase: 2490474713-xxx
✅ Pedido salvo no Supabase: 2490474713-xxx
```

### **4. Webhook (se configurado):**
```bash
# Após pagamento aprovado:
[WEBHOOK] Recebido do Mercado Pago: payment
[WEBHOOK] Pagamento 123456 - Status: approved
[BANCO] ✅ Pedido atualizado com sucesso: uuid
```

## 🎯 **RESULTADO ESPERADO:**

1. **Pedido criado** com `user_id` preenchido ✅
2. **Campos `customer_info` e `shipping_address`** preenchidos ✅
3. **Se webhook configurado**: Status muda para `'paid'` ✅

## 🚨 **SE AINDA DER ERRO:**

O problema está na **configuração do webhook** no Mercado Pago, não no código.
