'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { LikesProvider } from '@/contexts/LikesContextSupabase';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <LikesProvider>
        {children}
      </LikesProvider>
    </AuthProvider>
  );
}
