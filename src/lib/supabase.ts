import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Função para criar cliente Supabase de forma lazy
function createSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Supabase configuration missing:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    return null;
  }
}

// Supabase client para uso no servidor (service role)
export const supabaseAdmin: SupabaseClient | null = createSupabaseAdmin();