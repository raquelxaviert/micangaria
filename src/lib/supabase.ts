import { createClient } from '@supabase/supabase-js';

// Supabase client para uso no servidor (service role)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);