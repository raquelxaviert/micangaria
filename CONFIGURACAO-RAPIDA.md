# 🔧 CONFIGURAÇÃO RÁPIDA - MERCADO PAGO E MELHOR ENVIO

## 📝 **PASSO 1: Criar Contas**

### **Mercado Pago (OBRIGATÓRIO)**
1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma conta de desenvolvedor
3. Vá em **"Suas integrações"** → **"Criar aplicação"**
4. Nome: "RÜGE Vintage Store"
5. Tipo: **"Pagamentos online"**

### **Melhor Envio (RECOMENDADO)**
1. Acesse: https://melhorenvio.com.br
2. Cadastre sua empresa
3. Vá em **"Configurações"** → **"Tokens de acesso"**
4. Clique em **"Gerar novo token"**

---

## 🔑 **PASSO 2: Obter Credenciais**

### **Mercado Pago - Sandbox (Teste)**
No painel do Mercado Pago:
1. Clique em **"Credenciais de teste"**
2. Copie:
   - **Public Key**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token**: `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx-xxxxxxxx`

### **Melhor Envio - Sandbox (Teste)**
1. No painel, gere um token
2. Copie o token: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🚀 **PASSO 3: Configurar Projeto**

### **1. Criar arquivo .env.local**
```bash
# Na raiz do projeto, crie o arquivo .env.local
```

### **2. Adicionar credenciais**
```env
# === MERCADO PAGO SANDBOX ===
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx-xxxxxxxx
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# === MELHOR ENVIO SANDBOX ===
MELHOR_ENVIO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# === APP CONFIG ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### **3. Reiniciar servidor**
```bash
npm run dev
```

---

## 🧪 **PASSO 4: Testar**

### **1. Testar Demo**
```bash
# Acesse no navegador:
http://localhost:3000/checkout-demo
```

### **2. Testar APIs**
```bash
# Rodar script de teste:
node test_integrations.js
```

### **3. CEPs para teste**
- `01310-100` - São Paulo, SP (Av. Paulista)
- `20040-020` - Rio de Janeiro, RJ (Centro)
- `30112-000` - Belo Horizonte, MG
- `80010-000` - Curitiba, PR

### **4. Dados de teste - Cartão**
- **Número**: 4013 4013 4013 4013 (Visa)
- **CVV**: 123
- **Validade**: 11/25
- **Nome**: APRO (aprovado) ou OTHE (rejeitado)

---

## ⚠️ **PROBLEMAS COMUNS**

### **Erro: "Access token inválido"**
- Verifique se copiou o token completo
- Certifique-se que é o token de **TEST** (sandbox)
- Reinicie o servidor após alterar .env.local

### **Erro: "Webhook não encontrado"**
- Normal em desenvolvimento local
- Configure ngrok para testes avançados
- Em produção, use HTTPS obrigatoriamente

### **Erro: "CEP não encontrado"**
- Use CEPs válidos (8 dígitos)
- Teste com: 01310-100 (sempre funciona)

### **Frete não carrega**
- Verifique token do Melhor Envio
- Sistema tem fallback automático (Correios)
- Funciona mesmo sem Melhor Envio

---

## 🏆 **SUCESSO!**

Se tudo funcionou:
- ✅ Demo carrega sem erros
- ✅ Consegue calcular frete
- ✅ Consegue gerar PIX
- ✅ Checkout cartão abre

**🎉 Seu sistema de pagamentos está funcionando!**

---

## 🚀 **PARA PRODUÇÃO**

Quando for colocar no ar:

1. **Trocar credenciais para produção**
2. **Configurar webhook** no domínio final
3. **Testar com R$ 0,01** primeiro
4. **Certificado SSL** obrigatório
5. **Monitorar transações**

---

**💡 Dica: Comece sempre com o sandbox e valores baixos!**
