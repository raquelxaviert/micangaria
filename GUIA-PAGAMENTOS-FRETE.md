# 🚀 GUIA COMPLETO - CONFIGURAÇÃO DE PAGAMENTOS E FRETE

## 📋 **ÍNDICE**
1. [Configuração Mercado Pago](#mercado-pago)
2. [Configuração Melhor Envio](#melhor-envio)
3. [Instalação de Dependências](#instalacao)
4. [Variáveis de Ambiente](#variaveis)
5. [Testando o Sistema](#testes)
6. [Deploy em Produção](#producao)

---

## 💳 **MERCADO PAGO**

### **1. Criar Conta**
1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma conta de desenvolvedor
3. Acesse **"Suas integrações"**

### **2. Obter Credenciais**
1. Clique em **"Criar aplicação"**
2. Nome: "RÜGE Vintage Store"
3. Escolha: **"Pagamentos online"**
4. Copie as chaves:
   - **Public Key** (para frontend)
   - **Access Token** (para backend)

### **3. Configurar Webhooks**
1. No painel do Mercado Pago
2. Vá em **"Webhooks"**
3. URL: `https://seudominio.com/api/payment/webhook`
4. Eventos: `payment`, `plan`, `subscription`

### **4. Custos**
- **PIX**: 1,99%
- **Débito**: 4,99%
- **Crédito**: 5,99%
- **Parcelado**: 5,99% + 2,99% ao mês

---

## 📦 **MELHOR ENVIO**

### **1. Criar Conta**
1. Acesse: https://melhorenvio.com.br
2. Cadastre sua empresa
3. Vá em **"Configurações"** → **"Tokens de acesso"**

### **2. Obter Token**
1. Clique em **"Gerar novo token"**
2. Nome: "RÜGE API"
3. Permissões: **Todas** (shipping-calculate, shipping-cancel, etc.)
4. Copie o token gerado

### **3. Configurar Endereço de Origem**
- Configure o endereço da sua loja
- Será usado para calcular fretes

### **4. Vantagens**
- ✅ **Até 60% de desconto** nos fretes
- ✅ **Múltiplas transportadoras**
- ✅ **Rastreamento automático**
- ✅ **Seguro incluído**
- ✅ **Etiquetas prontas**

---

## 📥 **INSTALAÇÃO**

### **1. Instalar Dependências**

#### **Mercado Pago:**
```bash
npm install mercadopago
npm install @types/mercadopago --save-dev
```

#### **Utilitários:**
```bash
npm install axios
npm install @radix-ui/react-separator
```

### **2. Configurar package.json**
```json
{
  "dependencies": {
    "mercadopago": "^2.0.1",
    "axios": "^1.6.0"
  }
}
```

---

## 🔐 **VARIÁVEIS DE AMBIENTE**

### **1. Copiar arquivo exemplo**
```bash
cp .env.example .env.local
```

### **2. Preencher variáveis**
```env
# === MERCADO PAGO SANDBOX ===
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234-sua-access-token-sandbox
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key-sandbox

# === MELHOR ENVIO SANDBOX ===
MELHOR_ENVIO_TOKEN=seu_token_sandbox_aqui

# === APP ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### **3. Para PRODUÇÃO**
```env
# === MERCADO PAGO PRODUÇÃO ===
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-token-producao
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-chave-producao

# === MELHOR ENVIO PRODUÇÃO ===
MELHOR_ENVIO_TOKEN=seu_token_producao_aqui

# === APP ===
NEXT_PUBLIC_APP_URL=https://seudominio.com
NODE_ENV=production
```

---

## 🧪 **TESTANDO O SISTEMA**

### **1. Dados de Teste - Mercado Pago**

#### **Cartões de Teste:**
- **Visa**: 4013 4013 4013 4013
- **Mastercard**: 5031 4332 1540 6351
- **CVV**: 123
- **Validade**: 11/25
- **Nome**: APRO (aprovado) ou OTHE (rejeitado)

#### **PIX de Teste:**
- Use qualquer CPF válido
- O pagamento será simulado

#### **Usuário de Teste:**
- **Email da Loja**: test_user_285481368@testuser.com
- **Para testar pagamento**: Use um email de usuário COMPRADOR diferente

### **2. Testando Frete**
```javascript
// CEPs de teste
const ceps = [
  '01310-100', // São Paulo - SP
  '20040-020', // Rio de Janeiro - RJ  
  '30112-000', // Belo Horizonte - MG
  '80010-000'  // Curitiba - PR
];
```

### **3. Como Testar**
1. **Adicione produtos** ao carrinho
2. **Digite um CEP** válido
3. **Escolha o frete**
4. **Teste pagamento PIX** (mais rápido)
5. **Teste pagamento cartão**

---

## 🚀 **DEPLOY EM PRODUÇÃO**

### **1. Trocar Credenciais**
- Use tokens de **PRODUÇÃO**
- Configure webhooks para domínio final
- Teste com valores baixos primeiro

### **2. Configurar Domínio**
```env
NEXT_PUBLIC_APP_URL=https://ruge.com.br
```

### **3. SSL Obrigatório**
- Mercado Pago exige **HTTPS**
- Use certificado SSL válido

### **4. Validar Webhooks**
1. Teste com ferramentas como **ngrok** (desenvolvimento)
2. Monitore logs dos webhooks
3. Confirme recebimento de notificações

---

## 💡 **DICAS IMPORTANTES**

### **✅ Melhores Práticas**
- **Sempre validar** dados no backend
- **Nunca expor** access tokens no frontend
- **Loggar todos** os webhooks
- **Testar** com valores pequenos primeiro
- **Monitorar** taxas de conversão

### **⚠️ Cuidados**
- PIX expira em **30 minutos**
- Cartões podem ter **análise antifraude**
- Webhooks podem chegar **fora de ordem**
- **Sempre confirmar** status via API

### **📊 Monitoramento**
- Acompanhe **taxa de aprovação**
- Monitore **chargebacks**
- Analise **conversão por método**
- Configure **alertas** para falhas

---

## 🆘 **SUPORTE**

### **Mercado Pago**
- Documentação: https://www.mercadopago.com.br/developers
- Suporte: developers@mercadopago.com

### **Melhor Envio**
- Documentação: https://docs.melhorenvio.com.br
- Suporte: suporte@melhorenvio.com.br

---

**🎉 Pronto! Agora você tem um sistema completo de pagamentos e frete para seu e-commerce!**
