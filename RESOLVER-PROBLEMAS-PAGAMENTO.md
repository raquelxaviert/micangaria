# 🔧 INSTRUÇÕES PARA RESOLVER TODOS OS PROBLEMAS

## ⚠️ **PROBLEMA PRINCIPAL: SERVICE ROLE KEY**

Seu Supabase não está salvando porque a `SUPABASE_SERVICE_ROLE_KEY` está incorreta.

### **PASSO 1: Corrigir a Service Role Key**

1. **Acesse**: https://supabase.com/dashboard/project/koduoglrfzronbcgqrjc/settings/api
2. **Copie a chave**: `service_role` (ATENÇÃO: não a `anon` key)
3. **Substitua no seu `.env.local`** a linha:

```bash
# MUDE ESTA LINHA:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3NzczMiwiZXhwIjoyMDY1MTUzNzMyf0.COLOQUE_SUA_SERVICE_ROLE_KEY_REAL_AQUI

# PARA A CHAVE REAL (exemplo):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3NzczMiwiZXhwIjoyMDY1MTUzNzMyfQ.a_chave_real_vai_ser_bem_maior_que_isso
```

---

## 🔗 **PASSO 2: Configurar Webhook no Mercado Pago**

### **No Dashboard do Mercado Pago:**

1. **Acesse**: https://www.mercadopago.com.br/developers/panel/app
2. **Sua integração**: "RUGE BRECHO"
3. **Vá em**: Notificações → Webhooks
4. **Configure**:
   - **Modo**: `Teste` (modo sandbox)
   - **URL para teste**: `http://localhost:9002/api/webhooks/mercadopago`
   - **Eventos**: ✅ `Pagamentos`
   - **Salvar configurações**

---

## 🧪 **PASSO 3: Testar Pagamento Completo**

### **3.1 Reiniciar o servidor**
```bash
npm run dev
```

### **3.2 Fazer um pedido de teste**
1. **Acesse**: http://localhost:9002
2. **Adicione produtos** ao carrinho
3. **Vá no checkout**
4. **Preencha dados** (use e-mail DIFERENTE de `test_user_285481368@testuser.com`)
5. **Escolha frete**
6. **Clique "Pagar"**

### **3.3 Usar cartão de teste APROVADO**
```
Número: 4013 4013 4013 4013
CVV: 123
Vencimento: 11/25
Nome: APRO
```

---

## 📋 **CHECKLIST DE VERIFICAÇÃO**

### **Logs que você DEVE ver no terminal:**

✅ **Ao criar pedido:**
```
🛒 Criando preferência de pagamento...
💾 Pedido salvo no Supabase: 2490474713-xxx
```

✅ **Ao pagar (webhook):**
```
[WEBHOOK] Recebido do Mercado Pago: payment  
[WEBHOOK] Pagamento 123456 - Status: approved
[BANCO] ✅ Pedido atualizado com sucesso: uuid
[ETIQUETA] ✅ Etiqueta comprada com sucesso! ID: 789
```

### **Logs de ERRO que indicam problemas:**

❌ **Service Role Key errada:**
```
⚠️ Supabase configuration missing: hasServiceKey: false
⚠️ Supabase não configurado - pedido não foi salvo no banco
```

❌ **Webhook não configurado:**
```
# Webhook nunca é chamado
```

---

## 🔍 **VERIFICAR SE FUNCIONOU**

### **1. Verificar no Supabase Dashboard:**
- **Acesse**: https://supabase.com/dashboard/project/koduoglrfzronbcgqrjc/editor
- **Vá na tabela**: `orders`
- **Deve haver** registros com `status: 'pending'` e depois `status: 'paid'`

### **2. Verificar Melhor Envio:**
- **Sandbox**: https://sandbox.melhorenvio.com.br/painel
- **Deve haver etiquetas** compradas automaticamente

---

## 🚀 **RESUMO DE ERROS CORRIGIDOS:**

✅ **Webhook agora salva no Supabase** (antes só logava)  
✅ **Arquivo `.env.local` limpo** (sem duplicações)  
✅ **Instruções claras** para service role key  
✅ **Cartões de teste** específicos  
✅ **URLs de webhook** corretas  

## 🎯 **RESULTADO ESPERADO:**

1. **Pedido criado** → Salvo no Supabase como `pending`
2. **Pagamento aprovado** → Webhook atualiza para `paid`
3. **Etiqueta gerada** → Automaticamente no Melhor Envio
4. **Cliente recebe** → Confirmação e código de rastreamento

---

## 🔥 **SE AINDA DER ERRO:**

1. **Verifique se a service role key** está correta
2. **Confirme se o webhook** está configurado no MP
3. **Use e-mail diferente** da conta de teste da loja
4. **Teste com cartão APRO** (aprovado)
5. **Olhe os logs** no terminal do Next.js
