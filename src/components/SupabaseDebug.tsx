/**
 * 🔧 Componente para debug das variáveis de ambiente do Supabase
 * Use apenas em desenvolvimento para verificar se as env vars estão carregando
 */

'use client';

export default function SupabaseDebug() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔧 Supabase Debug</h3>
      <div className="space-y-1">
        <div>
          <strong>URL:</strong> {supabaseUrl ? '✅ Loaded' : '❌ Missing'}
        </div>
        <div>
          <strong>Key:</strong> {supabaseKey ? '✅ Loaded' : '❌ Missing'}
        </div>
        {supabaseUrl && (
          <div className="text-xs opacity-70 break-all">
            URL: {supabaseUrl}
          </div>
        )}
        {supabaseKey && (
          <div className="text-xs opacity-70 break-all">
            Key: {supabaseKey.substring(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
}
