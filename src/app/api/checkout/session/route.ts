import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, cart_items, customer_data, shipping_address, shipping_option } = body;

    // Buscar sessão existente
    const { data: existingSession } = await supabase
      .from('checkout_sessions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const sessionData = {
      user_id: user.id,
      step: step || 'customer',
      cart_items: cart_items || [],
      customer_data: customer_data || null,
      shipping_address: shipping_address || null,
      shipping_option: shipping_option || null,
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
    };

    let result;
    if (existingSession) {
      // Atualizar sessão existente
      result = await supabase
        .from('checkout_sessions')
        .update(sessionData)
        .eq('id', existingSession.id)
        .select();
    } else {
      // Criar nova sessão
      result = await supabase
        .from('checkout_sessions')
        .insert(sessionData)
        .select();
    }

    if (result.error) {
      console.error('Erro ao salvar sessão:', result.error);
      return NextResponse.json(
        { success: false, error: 'Erro ao salvar progresso' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: result.data[0]
    });

  } catch (error) {
    console.error('Erro na API de checkout session:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar sessão do usuário
    const { data: session, error } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Erro ao buscar sessão:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar sessão' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: session || null
    });

  } catch (error) {
    console.error('Erro na API de checkout session GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
