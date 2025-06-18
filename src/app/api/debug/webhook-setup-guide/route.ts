import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const setupGuide = {
    title: "Configuração do Webhook - Mercado Pago",
    problem: "O pagamento não está sendo finalizado - payment_id está null",
    diagnosis: {
      order_saved: "✅ Pedido salvo com sucesso",
      preference_created: "✅ Preferência criada",
      sandbox_mode: "✅ Usando sandbox_init_point",
      webhook_issue: "❌ Webhook não está processando o pagamento"
    },
    
    webhook_configuration: {
      url: "https://www.rugebrecho.com/api/webhooks/mercadopago",
      events: ["payment"],
      method: "POST",
      headers_expected: [
        "x-signature",
        "x-request-id", 
        "content-type: application/json"
      ]
    },
    
    setup_steps: [
      {
        step: 1,
        title: "Acessar Mercado Pago Developers",
        action: "Ir em https://www.mercadopago.com/developers",
        details: "Fazer login com sua conta de teste vendedor"
      },
      {
        step: 2,
        title: "Selecionar Aplicação",
        action: "Em 'Suas integrações', selecionar sua aplicação",
        details: "A mesma aplicação que gerou o token APP_USR-..."
      },
      {
        step: 3,
        title: "Configurar Webhooks",
        action: "Menu lateral > Webhooks > Configurar notificações",
        details: "Seção 'Modo produtivo'"
      },
      {
        step: 4,
        title: "Adicionar URL",
        action: "Inserir URL: https://www.rugebrecho.com/api/webhooks/mercadopago",
        details: "URL deve ser HTTPS e acessível publicamente"
      },
      {
        step: 5,
        title: "Selecionar Evento",
        action: "Selecionar evento 'Pagamentos'",
        details: "Este evento envia notificações quando pagamentos são criados/atualizados"
      },
      {
        step: 6,
        title: "Salvar Configuração",
        action: "Clicar em 'Salvar configuração'",
        details: "Isso gerará uma chave secreta para validação"
      },
      {
        step: 7,
        title: "Copiar Chave Secreta",
        action: "Copiar a chave secreta gerada",
        details: "Configurar como MERCADO_PAGO_WEBHOOK_SECRET no Vercel"
      },
      {
        step: 8,
        title: "Testar Webhook",
        action: "Clicar em 'Simular' para testar",
        details: "Verificar se a notificação chega no servidor"
      }
    ],
    
    environment_variables: {
      required: [
        "MERCADO_PAGO_ACCESS_TOKEN (APP_USR-... - credenciais de produção da conta de teste)",
        "MERCADO_PAGO_WEBHOOK_SECRET (chave secreta gerada no passo 7)",
        "MERCADO_PAGO_SANDBOX=true (já configurado)"
      ],
      optional: [
        "NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY (para frontend)"
      ]
    },
    
    testing: {
      webhook_test_url: "https://www.rugebrecho.com/api/debug/webhook-test",
      sandbox_status_url: "https://www.rugebrecho.com/api/debug/sandbox-status",
      webhook_config_url: "https://www.rugebrecho.com/api/debug/webhook-config"
    },
    
    troubleshooting: {
      webhook_not_received: [
        "1. Verificar se a URL está correta e acessível",
        "2. Verificar se o evento 'Pagamentos' está selecionado",
        "3. Verificar se a chave secreta está configurada",
        "4. Testar com a rota de debug: /api/debug/webhook-test"
      ],
      signature_validation_fails: [
        "1. Verificar se MERCADO_PAGO_WEBHOOK_SECRET está correto",
        "2. Verificar se a chave foi copiada completamente",
        "3. Verificar se não há espaços extras"
      ],
      payment_not_finalized: [
        "1. Verificar se o webhook está sendo chamado (logs do servidor)",
        "2. Verificar se o external_reference está correto",
        "3. Verificar se o pagamento foi realmente aprovado no Mercado Pago"
      ]
    },
    
    sandbox_specific: {
      important: "Mesmo em sandbox, usar credenciais de PRODUÇÃO da conta de teste",
      credentials: "Token deve começar com APP_USR- (não TEST-)",
      webhook: "Webhook deve ser configurado na mesma aplicação que gerou o token",
      testing: "Usar cartões de teste da documentação do Mercado Pago"
    },
    
    cartoes_teste: {
      mastercard: "5031 4332 1540 6351",
      visa: "4235 6477 2802 5682", 
      amex: "3753 651535 56885",
      elo: "5067 7667 8388 8311",
      cpf_aprovado: "12345678909",
      nome_aprovado: "APRO"
    },
    
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(setupGuide);
} 