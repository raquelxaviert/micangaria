import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Usar valores diretos das variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://koduoglrfzronbcgqrjc.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZHVvZ2xyZnpyb25iY2dxcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzc3MzIsImV4cCI6MjA2NTE1MzczMn0.pQ62WyGKV5tyrYsEddp2h8zRVCDf1qZ23uE8z4-FPUI';

  console.log('🔍 Supabase Client Config:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPreview: supabaseUrl?.substring(0, 30) + '...',
    keyPreview: supabaseKey?.substring(0, 30) + '...'
  });

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }

  if (!supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
