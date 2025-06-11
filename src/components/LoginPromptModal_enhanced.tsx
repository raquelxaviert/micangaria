'use client';

import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginPromptModal({ isOpen, onClose, onLogin }: LoginPromptModalProps) {
  const { user } = useAuth();

  // Se o usuário estiver logado, não mostrar o modal
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (!isOpen || user) return null;

  return (
    <>
      {/* Overlay com transição suave */}
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
        {/* Modal Container com animação de entrada */}
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
          {/* Botão fechar com hover suave */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              width: '32px',
              height: '32px',
              padding: 0,
              color: '#6b7280',
              zIndex: 10,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-out'
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = '#f3f4f6';
              target.style.color = '#374151';
              target.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'transparent';
              target.style.color = '#6b7280';
              target.style.transform = 'scale(1)';
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>

          {/* Header */}
          <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              marginBottom: '12px',
              animation: 'fadeIn 0.6s ease-out 0.2s both'
            }}>
              <Image
                src="/logo_completa.svg"
                alt="RÜGE"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: 0,
              animation: 'fadeIn 0.6s ease-out 0.3s both'
            }}>
              Item salvo nos seus favoritos!
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '20px',
              animation: 'fadeIn 0.6s ease-out 0.4s both'
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                🎉 <strong>Ótima escolha!</strong> Seu item foi adicionado aos favoritos.
              </p>
              <div style={{
                background: 'linear-gradient(to right, #fef2f2, #fdf2f8)',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                transition: 'all 0.3s ease-out',
                transform: 'scale(1)'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1.02)';
                target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.15)';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1)';
                target.style.boxShadow = 'none';
              }}
              >
                <p style={{ fontSize: '14px', color: '#991b1b', fontWeight: '500', marginBottom: '8px' }}>
                  💡 Dica especial:
                </p>
                <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>
                  Faça login para <strong>sincronizar seus favoritos</strong> entre todos os seus dispositivos e nunca perder seus achados especiais!
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              animation: 'fadeIn 0.6s ease-out 0.5s both'
            }}>
              {/* Botão principal com animações avançadas */}
              <button
                onClick={onLogin}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#780116',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#5a0e13';
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  
                  // Efeito de brilho
                  const shimmer = document.createElement('div');
                  shimmer.style.position = 'absolute';
                  shimmer.style.top = '0';
                  shimmer.style.left = '-100%';
                  shimmer.style.width = '100%';
                  shimmer.style.height = '100%';
                  shimmer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)';
                  shimmer.style.animation = 'shimmer 0.6s ease-out';
                  shimmer.style.pointerEvents = 'none';
                  target.appendChild(shimmer);
                  
                  setTimeout(() => {
                    if (shimmer.parentNode) {
                      shimmer.parentNode.removeChild(shimmer);
                    }
                  }, 600);
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#780116';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <Sparkles style={{ 
                  width: '16px', 
                  height: '16px',
                  transition: 'transform 0.3s ease-out'
                }} />
                Fazer Login / Registrar
              </button>
              
              {/* Botão secundário com transições suaves */}
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0)'
                }}
                onMouseOver={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#f9fafb';
                  target.style.borderColor = '#9ca3af';
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                  target.style.color = '#111827';
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = 'transparent';
                  target.style.borderColor = '#d1d5db';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'none';
                  target.style.color = '#374151';
                }}
              >
                Continuar sem login
              </button>
            </div>

            <p style={{ 
              fontSize: '12px', 
              textAlign: 'center', 
              color: '#6b7280', 
              marginTop: '16px', 
              margin: '16px 0 0 0',
              animation: 'fadeIn 0.6s ease-out 0.6s both',
              opacity: 0.8
            }}>
              ✨ Membros registrados recebem ofertas exclusivas!
            </p>
          </div>
        </div>
      </div>

      {/* CSS inline para animações */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmer {
          from {
            left: -100%;
          }
          to {
            left: 100%;
          }
        }
      `}</style>
    </>
  );
}
