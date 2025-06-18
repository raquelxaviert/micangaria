import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabaseAdmin } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 🛒 API para criar preferência de pagamento com frete incluído
 * 
 * FLUXO:
 * 1. Cliente escolhe produtos + frete
 * 2. Sistema calcula total (produtos + frete)
 * 3. Cria preferência no Mercado Pago
 * 4. Cliente paga o total
 * 5. Webhook processa e gera etiqueta automaticamente
 */

// Configuração do Mercado Pago
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ MERCADO_PAGO_ACCESS_TOKEN not configured');
}

const client = accessToken ? new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
}) : null;

const preference = client ? new Preference(client) : null;

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação do usuário
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Usuário não autenticado:', authError?.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Usuário não autenticado. Faça login para continuar.'
        },
        { status: 401 }
      );
    }

    console.log('✅ Usuário autenticado:', user.email, 'ID:', user.id);
    // Verificar se estamos em ambiente de build
    if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
      // Ambiente local, prosseguir normalmente
    } else if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      // Em produção, verificar se as variáveis essenciais existem
      console.warn('⚠️ Environment variables not configured for production build');
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    const {
      items, // Produtos do carrinho
      shippingOption, // Opção de frete escolhida
      customerInfo, // Dados do cliente
      shippingAddress // Endereço de entrega
    } = body;    // Validar dados obrigatórios
    if (!customerInfo?.email || !customerInfo?.name) {
      console.error('❌ Dados do cliente incompletos:', customerInfo);
      return NextResponse.json(
        {
          success: false,
          error: 'Dados do cliente são obrigatórios (nome e email)'
        },
        { status: 400 }
      );
    }

    // Verificar se não está tentando "pagar para si mesmo"
    const storeTestEmail = process.env.MP_STORE_TEST_EMAIL;
    if (customerInfo.email === storeTestEmail) {
      console.error('❌ Cliente usando mesmo e-mail da loja:', customerInfo.email);
      return NextResponse.json(
        {
          success: false,
          error: 'Use um e-mail diferente do e-mail da loja para testar'
        },
        { status: 400 }
      );
    }

    // Validação defensiva para preço do frete
    if (!shippingOption || isNaN(parseFloat(shippingOption.price))) {
      console.error('❌ Frete inválido:', shippingOption);
      return NextResponse.json(
        {
          success: false,
          error: 'Opção de frete inválida. Não foi possível calcular o valor do frete.',
          details: shippingOption
        },
        { status: 400 }
      );
    }

    console.log('🛒 Criando preferência de pagamento...');
    console.log('📦 Items:', items.length);
    console.log('🚚 Frete:', shippingOption.name, '- R$', shippingOption.price);

    // Calcular total dos produtos
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    );
    
    const shippingCost = parseFloat(shippingOption.price);
    const total = subtotal + shippingCost;

    console.log('💰 Subtotal produtos: R$', subtotal.toFixed(2));
    console.log('💰 Custo frete: R$', shippingCost.toFixed(2));
    console.log('💰 Total final: R$', total.toFixed(2));

    // Preparar itens para o Mercado Pago
    const mercadoPagoItems = [
      // Produtos
      ...items.map((item: any) => ({
        id: item.id,
        title: item.title,
        category_id: 'fashion',
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: item.unit_price
      })),
      // Frete como item separado
      {
        id: 'shipping',
        title: `Frete - ${shippingOption.name}`,
        category_id: 'shipping',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: shippingCost
      }    ];    // Dados do comprador (usar os dados enviados pelo frontend)
    // Local sempre usa sandbox, Vercel usa a variável
    const isSandbox = process.env.NODE_ENV === 'development' || process.env.MERCADO_PAGO_SANDBOX === 'true';
    
    // Preparar dados do pagador com validação rigorosa
    const payer = {
      name: customerInfo.name.trim(),
      email: customerInfo.email.toLowerCase().trim(),
      phone: {
        area_code: String(customerInfo.phone?.substring(0, 2) || '11'),
        number: String(customerInfo.phone?.substring(2) || '999999999')
      },
      identification: {
        type: 'CPF',
        number: String(customerInfo.document || '12345678909').replace(/\D/g, '') // Remove caracteres não numéricos
      },
      address: {
        street_name: String(shippingAddress.address || 'Rua Teste'),
        street_number: String(shippingAddress.number || '123'),
        zip_code: String(shippingAddress.postal_code || '01310100').replace(/\D/g, '') // Remove caracteres não numéricos
      }
    };    console.log('👤 Dados do pagador validados:', { 
      name: payer.name, 
      email: payer.email,
      phone: `${payer.phone.area_code}${payer.phone.number}`,
      cpf: payer.identification.number,
      isSandbox 
    });

    // Validar se dados do pagador estão corretos
    if (!payer.email.includes('@') || payer.name.length < 2) {
      console.error('❌ Dados do pagador inválidos');
      return NextResponse.json(
        {
          success: false,
          error: 'Dados do pagador inválidos'
        },
        { status: 400 }
      );
    }    // Definir URLs base - FORÇAR URL CORRETA
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.rugebrecho.com';
    const webhookUrl = 'https://www.rugebrecho.com/api/webhooks/mercadopago'; // URL fixa para webhook
    
    console.log('🔗 URLs configuradas:', {
      baseUrl,
      webhookUrl,
      success: `${baseUrl}/checkout/success`,
      failure: `${baseUrl}/checkout/failure`,
      pending: `${baseUrl}/checkout/pending`,
      notification: webhookUrl
    });

    // Criar preferência    // Gerar external_reference único
    const external_reference = `RUGE${Date.now()}`;

    const preferenceData = {
      items: mercadoPagoItems,
      payer,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      shipments: {
        cost: shippingCost,
        mode: 'not_specified'
      },
      back_urls: {
        success: `${baseUrl}/checkout/success?external_ref=${external_reference}`,
        failure: `${baseUrl}/checkout/failure?external_ref=${external_reference}`,
        pending: `${baseUrl}/checkout/pending?external_ref=${external_reference}`
      },
      auto_return: 'approved', // Redirecionar automaticamente para success quando aprovado
      external_reference: external_reference, // ID único simples
      notification_url: webhookUrl, // Usar URL fixa do webhook
      metadata: {
        // Simplificar metadata para evitar erros
        order_id: `RUGE${Date.now()}`,
        total_amount: total,
        shipping_service: shippingOption.name,
        customer_email: customerInfo.email
      }
    };

    // Verificar se o Mercado Pago está configurado
    if (!preference) {
      return NextResponse.json(
        { success: false, error: 'Payment service not configured' },
        { status: 503 }
      );
    }

    const response = await preference.create({ body: preferenceData });console.log('✅ Preferência criada:', response.id);    // Persistir pedido no Supabase
    console.log('🔍 [DEBUG] Verificando Supabase:', {
      hasSupabaseAdmin: !!supabaseAdmin,
      environment: process.env.NODE_ENV,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'
    });    if (supabaseAdmin) {
      const orderData = {
        user_id: user.id, // ✅ Agora salva o ID do usuário autenticado
        preference_id: response.id,
        external_reference: preferenceData.external_reference,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        subtotal: subtotal, // ✅ Campo obrigatório
        shipping_cost: shippingCost,
        total: total, // ✅ Campo obrigatório
        items: items, // ✅ Campo obrigatório (JSONB)
        shipping_option: shippingOption, // ✅ JSONB
        customer_info: { // ✅ JSONB
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone || null,
          document: customerInfo.document || null
        },
        shipping_address: shippingAddress, // ✅ JSONB
        status: 'pending'
      };

      // Validar se o e-mail do pedido é igual ao do usuário autenticado
      if (customerInfo.email !== user.email) {
        console.error('❌ E-mail do pedido não confere com usuário logado:', {
          userEmail: user.email,
          orderEmail: customerInfo.email
        });
        return NextResponse.json(
          {
            success: false,
            error: 'E-mail do pedido deve ser igual ao da conta logada.'
          },
          { status: 400 }
        );
      }

      console.log('💾 Salvando pedido no Supabase...', {
        user_id: orderData.user_id,
        user_email: user.email,
        preference_id: orderData.preference_id,
        customer_email: orderData.customer_info.email,
        total: orderData.total,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        environment: process.env.NODE_ENV
      });
        const { data, error } = await supabaseAdmin.from('orders').insert(orderData);
      
      if (error) {
        console.error('❌ Erro ao salvar no Supabase:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          user_id: user.id
        });
        console.error('❌ Service Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 'MISSING');
        
        // Não bloquear o checkout se houver erro no banco
        console.warn('⚠️ Continuando checkout apesar do erro no banco');
      } else {
        console.log('✅ Pedido salvo no Supabase com sucesso:', {
          preference_id: response.id,
          user_id: user.id,
          user_email: user.email
        });
        console.log('✅ Dados salvos:', data);
      }    } else {
      console.error('⚠️ Supabase não configurado - variáveis de ambiente:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        environment: process.env.NODE_ENV,
        user_id: user.id
      });
    }return NextResponse.json({
      success: true,
      preference_id: response.id,      // Usar sandbox_init_point apenas se MERCADO_PAGO_SANDBOX=true
      init_point: isSandbox ? response.sandbox_init_point : response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      total: total,
      breakdown: {
        subtotal: subtotal,
        shipping: shippingCost,
        total: total
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar pagamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
