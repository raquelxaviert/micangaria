import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minha Conta - RÜGE',
  description: 'Gerencie seus dados pessoais, pedidos e preferências',
};

export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 