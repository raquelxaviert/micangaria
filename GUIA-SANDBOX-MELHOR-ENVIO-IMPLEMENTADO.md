# Guia Completo - Melhor Envio Sandbox

## 📋 Resumo das Implementações

### ✅ Implementado no `route.ts`

1. **Detecção Automática de Ambiente**
   - Desenvolvimento (`NODE_ENV=development`) → Sandbox automático
   - Produção (`NODE_ENV=production`) → Produção automático
   - Forçar Sandbox → `MELHOR_ENVIO_SANDBOX=true`

2. **Configuração Inteligente**
   - URLs diferentes para cada ambiente
   - Tokens específicos para Sandbox e Produção
   - Logs detalhados para debugging

3. **Limitações do Sandbox Respeitadas**
   - Apenas serviços Correios (1,2,17,18) e Jadlog (3,4)
   - Fallback inteligente com transportadoras corretas

4. **Sistema de Logs Avançado**
   - Identificação clara do ambiente em uso
   - Logs de sucesso e erro diferenciados
   - Informações de debugging completas

## 🔧 Configuração das Variáveis de Ambiente

```env
# === TOKENS DO MELHOR ENVIO ===
MELHOR_ENVIO_TOKEN=seu_token_de_producao
MELHOR_ENVIO_SANDBOX_TOKEN=seu_token_de_sandbox

# === FORÇAR SANDBOX (OPCIONAL) ===
# MELHOR_ENVIO_SANDBOX=true
```

## 🧪 Como Funciona o Sandbox

### Características do Ambiente Sandbox:
- **URL**: `https://sandbox.melhorenvio.com.br/api/v2`
- **Saldo Fictício**: R$ 10.000,00 para testes
- **Transportadoras**: Apenas Correios e Jadlog
- **Aprovação**: Automática após 5 minutos
- **Status**: Modificados após 15 minutos
- **Envios**: Apenas simulações, não reais

### Diferenças da Produção:
- **URL**: `https://melhorenvio.com.br/api/v2`
- **Saldo Real**: Necessário crédito real
- **Transportadoras**: Todas disponíveis
- **Aprovação**: Processamento real
- **Envios**: Reais com transportadoras

## 🚀 Como Testar

### 1. Testar a API Diretamente
```bash
node test_melhor_envio_sandbox_complete.js
```

### 2. Testar via Frontend
A API `/api/shipping/calculate` agora:
- Detecta automaticamente o ambiente
- Usa os tokens corretos
- Limita serviços no sandbox
- Fornece logs detalhados

### 3. Exemplo de Requisição
```javascript
const response = await fetch('/api/shipping/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: {
      postal_code: '01310100',
      address: 'Avenida Paulista',
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state_abbr: 'SP'
    },
    to: {
      postal_code: '20040020',
      city: 'Rio de Janeiro',
      state_abbr: 'RJ'
    },
    products: [{
      width: 20, height: 10, length: 30,
      weight: 1.5, unitary_value: 150.00, quantity: 1
    }]
  })
});
```

## 📊 Logs de Monitoramento

### Logs de Sucesso:
```
[MELHOR ENVIO] Ambiente: SANDBOX
[MELHOR ENVIO] URL: https://sandbox.melhorenvio.com.br/api/v2
[MELHOR ENVIO] 3 opções de frete encontradas
```

### Logs de Erro:
```
[MELHOR ENVIO] Erro na API: Token inválido
[MELHOR ENVIO] Ambiente atual: SANDBOX
[FALLBACK] Calculando frete básico - Ambiente: SANDBOX
```

## 🔄 Fluxo de Funcionamento

1. **Detecção de Ambiente**
   - Verifica `NODE_ENV` e `MELHOR_ENVIO_SANDBOX`
   - Define URL e token apropriados

2. **Requisição à API**
   - Usa serviços limitados no sandbox
   - Headers corretos com User-Agent

3. **Processamento da Resposta**
   - Sucesso: Formata e retorna opções
   - Erro: Ativa fallback com transportadoras básicas

4. **Sistema de Fallback**
   - Correios PAC e SEDEX sempre disponíveis
   - Jadlog em ambos os ambientes
   - Loggi apenas em produção

## ⚠️ Pontos de Atenção

### Sandbox:
- ✅ Ideal para desenvolvimento e testes
- ✅ Não consome saldo real
- ❌ Limitado a Correios e Jadlog
- ❌ Não realiza envios reais

### Produção:
- ✅ Todas as transportadoras
- ✅ Envios reais
- ❌ Consome saldo real
- ❌ Requer configuração mais rigorosa

## 🎯 Próximos Passos

1. **Configurar Tokens**
   - Obter token do sandbox em `https://sandbox.melhorenvio.com.br/`
   - Obter token de produção em `https://melhorenvio.com.br/`

2. **Testar Ambiente**
   - Executar script de teste
   - Verificar logs no console
   - Validar cálculos de frete

3. **Deploy Gradual**
   - Começar com sandbox
   - Migrar para produção após testes
   - Monitorar logs em produção

## 📝 Arquivos Modificados

- `src/app/api/shipping/calculate/route.ts` - API principal
- `env-melhor-envio.txt` - Exemplo de configuração
- `test_melhor_envio_sandbox_complete.js` - Script de teste

Toda a implementação está pronta e seguindo as melhores práticas do Melhor Envio! 🚀
