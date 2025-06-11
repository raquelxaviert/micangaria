'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Eye, EyeOff } from 'lucide-react';
import { useLikes } from '@/contexts/LikesContextSupabase';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { syncFavorites } = useLikes();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Login realizado com sucesso!');
        await syncFavorites();
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar.');
        setTimeout(() => {
          setActiveTab('login');
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <>      {/* Overlay com animação suave */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          minWidth: '100vw',
          minHeight: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          margin: 0,
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Modal Container com entrada suave */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            margin: 'auto',
            animation: 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: 'translateY(0)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão fechar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              width: '32px',
              height: '32px',
              padding: 0,
              color: '#6b7280',
              zIndex: 10
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </Button>          {/* Header */}
          <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Image
                src="/logo_completa.svg"
                alt="RÜGE"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Entre na sua conta para sincronizar seus favoritos
            </p>
          </div>

          {/* Tabs */}
          <div style={{ padding: '0 24px' }}>
            <div style={{ 
              display: 'flex', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px', 
              padding: '4px' 
            }}>
              <button
                onClick={() => setActiveTab('login')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'login' ? 'white' : 'transparent',
                  color: activeTab === 'login' ? '#111827' : '#6b7280',
                  boxShadow: activeTab === 'login' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                Entrar
              </button>
              <button
                onClick={() => setActiveTab('register')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'register' ? 'white' : 'transparent',
                  color: activeTab === 'register' ? '#111827' : '#6b7280',
                  boxShadow: activeTab === 'register' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                Cadastrar
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <Label htmlFor="email" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ marginTop: '4px' }}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Senha
                  </Label>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '40px' }}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        height: '100%',
                        width: '40px',
                        padding: 0
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                      ) : (
                        <Eye style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <Label htmlFor="fullName" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Nome completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ marginTop: '4px' }}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registerEmail" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Email
                  </Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ marginTop: '4px' }}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registerPassword" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Senha
                  </Label>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <Input
                      id="registerPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '40px' }}
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        height: '100%',
                        width: '40px',
                        padding: 0
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                      ) : (
                        <Eye style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
            )}

            {/* Google Login */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', borderTop: '1px solid #d1d5db' }} />
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '12px', textTransform: 'uppercase' }}>
                  <span style={{ backgroundColor: 'white', padding: '0 8px', color: '#6b7280' }}>Ou continue com</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                style={{ marginTop: '12px' }}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg style={{ marginRight: '8px', width: '16px', height: '16px' }} viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert style={{ marginTop: '16px', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                <AlertDescription style={{ color: '#991b1b', fontSize: '14px' }}>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert style={{ marginTop: '16px', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
                <AlertDescription style={{ color: '#166534', fontSize: '14px' }}>
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
