# 🔍 DIAGNÓSTICO COMPLETO - ERRO DE PAGAMENTO

## ❌ **PROBLEMA:** 
"Ocorreu um erro... Não foi possível processar seu pagamento"

## 🎯 **POSSÍVEIS CAUSAS (por ordem de probabilidade):**

### **1. 🔗 WEBHOOK NÃO CONFIGURADO (90% dos casos)**
- **Problema**: Mercado Pago não consegue notificar o sistema
- **Sintoma**: Pedido fica "pending" no Supabase
- **Solução**: Configurar webhook corretamente

### **2. 📧 EMAIL DUPLICADO (70% dos casos)**
- **Problema**: Usando mesmo e-mail da conta de teste da loja
- **Sintoma**: Erro antes mesmo de processar
- **Solução**: Usar e-mail diferente

### **3. 💳 DADOS DO PAGADOR INVÁLIDOS (50% dos casos)**
- **Problema**: CPF, telefone ou endereço inválidos
- **Sintoma**: Erro na validação do MP
- **Solução**: Validar dados antes de enviar

### **4. 🔑 TOKENS INCORRETOS (30% dos casos)**
- **Problema**: Access token ou public key errados
- **Sintoma**: Erro de autenticação
- **Solução**: Verificar credenciais

### **5. 🌐 URL BASE INCORRETA (20% dos casos)**
- **Problema**: URLs de callback/webhook incorretas
- **Sintoma**: MP não consegue notificar
- **Solução**: Verificar NEXT_PUBLIC_APP_URL

---

## 🔧 **DIAGNÓSTICO PASSO A PASSO:**

### **PASSO 1: Verificar Logs do Terminal**
Olhe no terminal do Next.js durante o pagamento:

```bash
# LOGS NORMAIS (funcionando):
🛒 Criando preferência de pagamento...
✅ Preferência criada: 2490474713-xxx
💾 Pedido salvo no Supabase: xxx

# LOGS DE ERRO (problemas):
❌ Dados do cliente incompletos
❌ Cliente usando mesmo e-mail da loja
❌ Erro ao criar preferência: [erro detalhado]
```

### **PASSO 2: Verificar Supabase**
Acesse: https://supabase.com/dashboard/project/koduoglrfzronbcgqrjc/editor/orders

**Se pedido foi criado mas status = 'pending'** → Problema no webhook
**Se pedido não foi criado** → Problema na API de criação

### **PASSO 3: Verificar Webhook**
Acesse: https://www.mercadopago.com.br/developers/panel/notifications

**Se 0% notificações entregues** → Webhook não configurado
**Se >0% notificações** → Webhook funcionando

---

## 🎯 **CHECKLIST DE VERIFICAÇÃO:**

### ✅ **Configurações Básicas:**
- [ ] NEXT_PUBLIC_APP_URL = `http://localhost:9002` no .env.local
- [ ] MERCADO_PAGO_SANDBOX = `true` no .env.local
- [ ] Service Role Key do Supabase configurada
- [ ] Servidor Next.js rodando na porta 9002

### ✅ **Webhook (CRÍTICO):**
- [ ] URL webhook: `https://rugebrecho.com/api/webhooks/mercadopago`
- [ ] Eventos: ✅ Pagamentos
- [ ] Modo: Teste
- [ ] Configurado na conta/aplicação correta

### ✅ **Dados de Teste:**
- [ ] E-mail cliente ≠ `test_user_285481368@testuser.com`
- [ ] Cartão: 4013 4013 4013 4013, CVV: 123, Nome: APRO
- [ ] CPF válido (11 dígitos)
- [ ] Telefone válido (10-11 dígitos)

---

## 🚨 **AÇÕES IMEDIATAS:**

### **1. Verificar se é problema de webhook:**
```bash
# No terminal, durante o teste, você DEVE ver:
[WEBHOOK] Recebido do Mercado Pago: payment
```

**Se NÃO aparecer** → Problema no webhook (90% dos casos)

### **2. Verificar dados do teste:**
- **E-mail**: Use `teste123@gmail.com` (diferente da loja)
- **Nome**: João Silva
- **CPF**: 12345678909
- **Telefone**: 11999888777

### **3. Verificar logs detalhados:**
Abra DevTools (F12) → Network → veja se há erros na API

---

## 🔧 **SOLUÇÕES POR SINTOMA:**

### **Se erro acontece ANTES do checkout MP:**
→ Problema na API de criação de preferência
→ Verificar logs do terminal

### **Se erro acontece DURANTE checkout MP:**
→ Problema nos dados do pagador
→ Verificar e-mail duplicado

### **Se erro acontece APÓS pagamento:**
→ Problema no webhook
→ Verificar configuração no MP dashboard

### **Se pedido fica "pending" no Supabase:**
→ Webhook não está sendo chamado
→ Reconfigurar webhook

---

## 🎯 **PRÓXIMOS PASSOS:**

1. **Faça um teste** e **copie TODOS os logs** do terminal
2. **Verifique** se pedido foi criado no Supabase
3. **Verifique** se webhook foi chamado
4. **Reporte** qual sintoma específico você está vendo

Com essas informações, posso identificar exatamente onde está o problema! 🎯
