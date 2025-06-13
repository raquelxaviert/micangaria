# 🔍 DIAGNÓSTICO: Cartão APRO Falhando

## ❌ **PROBLEMA ATUAL:**
Cartão de teste APRO está dando erro "Não foi possível processar seu pagamento"

## 🎯 **CAUSAS MAIS COMUNS:**

### 1. **E-mail duplicado (mais comum)**
- **Problema**: Usando mesmo e-mail da conta de teste da loja
- **Solução**: Use e-mail diferente de `test_user_285481368@testuser.com`

### 2. **Dados do pagador incompletos/inválidos**
- **CPF inválido** ou muito genérico
- **Telefone** em formato incorreto
- **Endereço** com dados faltantes

### 3. **Configuração sandbox incorreta**
- **URL do webhook** não configurada
- **Tokens** de sandbox incorretos

### 4. **Metadados muito grandes**
- **JSON no metadata** muito pesado
- **Strings muito longas**

## 🔧 **SOLUÇÕES A IMPLEMENTAR:**

### ✅ **1. Validação rigorosa de e-mail**
### ✅ **2. CPF e telefone válidos**  
### ✅ **3. Metadata simplificado**
### ✅ **4. Logs detalhados de erro**

## 🧪 **TESTE APÓS CORREÇÕES:**

**Cartão:** 4013 4013 4013 4013
**CVV:** 123  
**Vencimento:** 11/25
**Nome:** APRO
**E-mail:** teste123@gmail.com (DIFERENTE da loja)
