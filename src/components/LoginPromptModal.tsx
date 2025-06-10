'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

  if (!isOpen || user) return null;  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: 'rgba(0, 0, 0, 0.25) 0px 25px 50px -12px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
            justifyContent: 'center'
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Header */}
        <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Heart style={{ width: '24px', height: '24px', color: '#ef4444', fill: 'currentColor' }} />
              <Sparkles style={{ width: '16px', height: '16px', color: '#facc15', position: 'absolute', top: '-4px', right: '-4px' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>RÜGE</h1>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Item salvo nos seus favoritos!
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              🎉 <strong>Ótima escolha!</strong> Seu item foi adicionado aos favoritos.
            </p>
            <div style={{
              background: 'linear-gradient(to right, #fef2f2, #fdf2f8)',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '14px', color: '#991b1b', fontWeight: '500', marginBottom: '8px' }}>
                💡 Dica especial:
              </p>
              <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>
                Faça login para <strong>sincronizar seus favoritos</strong> entre todos os seus dispositivos e nunca perder seus achados especiais!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                transition: 'background-color 0.2s'
              }}              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#5a0e13'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#780116'}
            >
              <Heart style={{ width: '16px', height: '16px' }} />
              Fazer Login / Registrar
            </button>
            
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
                transition: 'background-color 0.2s'
              }}              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              Continuar sem login
            </button>
          </div>

          <p style={{ fontSize: '12px', textAlign: 'center', color: '#6b7280', marginTop: '16px', margin: '16px 0 0 0' }}>
            ✨ Membros registrados recebem ofertas exclusivas!
          </p>
        </div>
      </div>
    </div>
  );
}
