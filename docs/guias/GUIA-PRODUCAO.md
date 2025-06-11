# 🚀 Guia de Integração com Domínio Próprio e Produção

## 📋 Índice
1. [Configuração do Stripe](#configuração-do-stripe)
2. [Domínio Próprio](#domínio-próprio)
3. [Deploy em Produção](#deploy-em-produção)
4. [Configuração de Email](#configuração-de-email)
5. [Banco de Dados](#banco-de-dados)
6. [SSL e Segurança](#ssl-e-segurança)
7. [Monitoramento](#monitoramento)

## 🔐 Configuração do Stripe

### 1. Criar Conta no Stripe
1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Complete o processo de verificação da conta
3. Ative os pagamentos no Brasil

### 2. Configurar Chaves de API
No painel do Stripe, vá em **Developers > API Keys**:

```env
# .env.production
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_publica_real
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta_real
```

### 3. Configurar Webhooks
1. No painel do Stripe, vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL do endpoint: `https://seudominio.com.br/api/webhooks/stripe`
4. Eventos para escutar:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copie o **Signing secret** para o `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_sua_webhook_secret_real
```

## 🌐 Domínio Próprio

### 1. Registrar Domínio
Registre seu domínio em provedores como:
- **Registro.br** (para .com.br)
- **GoDaddy**
- **Namecheap**
- **Cloudflare**

### 2. Configurar DNS
Configure os registros DNS para apontar para seu provedor de hospedagem:

```dns
# Exemplo para Vercel
CNAME www sua-app.vercel.app
A @    76.76.19.61 (ou IP do seu provedor)
```

### 3. Configurar SSL
A maioria dos provedores oferece SSL gratuito via Let's Encrypt:
- **Vercel**: SSL automático
- **Netlify**: SSL automático
- **Cloudflare**: SSL automático

## 🚀 Deploy em Produção

### Opção 1: Vercel (Recomendado para Next.js)

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Configurar Variáveis de Ambiente:**
```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_SITE_URL production
```

### Opção 2: Netlify

1. **Build da aplicação:**
```bash
npm run build
```

2. **Deploy via CLI:**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=out
```

### Opção 3: Railway

1. **Conectar repositório GitHub**
2. **Configurar variáveis de ambiente**
3. **Deploy automático**

### Opção 4: DigitalOcean App Platform

1. **Conectar repositório**
2. **Configurar build settings:**
   - Build Command: `npm run build`
   - Run Command: `npm start`

## 📧 Configuração de Email

### Opção 1: Resend (Recomendado)

1. **Criar conta em [resend.com](https://resend.com)**
2. **Instalar dependência:**
```bash
npm install resend
```

3. **Configurar:**
```env
RESEND_API_KEY=re_sua_chave_aqui
```

4. **Código de exemplo:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@micangaria.com.br',
  to: customerEmail,
  subject: 'Pedido confirmado',
  html: emailTemplate
});
```

### Opção 2: SendGrid

```bash
npm install @sendgrid/mail
```

```env
SENDGRID_API_KEY=SG.sua_chave_aqui
```

### Opção 3: Nodemailer com Gmail

```bash
npm install nodemailer
```

```env
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_de_app
```

## 🗄️ Banco de Dados

### Opção 1: Supabase (Recomendado)

1. **Criar projeto em [supabase.com](https://supabase.com)**
2. **Instalar cliente:**
```bash
npm install @supabase/supabase-js
```

3. **Configurar:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

4. **Schema SQL:**
```sql
-- Tabela de produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  type TEXT,
  style TEXT,
  category TEXT,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_promotion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'paid',
  order_status TEXT DEFAULT 'preparing',
  items JSONB NOT NULL,
  shipping_address JSONB,
  tracking_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Opção 2: PlanetScale

```bash
npm install @planetscale/database
```

### Opção 3: MongoDB Atlas

```bash
npm install mongodb
```

## 🔒 SSL e Segurança

### 1. HTTPS Obrigatório
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Forçar HTTPS em produção
  if (process.env.NODE_ENV === 'production' && 
      !request.nextUrl.href.startsWith('https://')) {
    return NextResponse.redirect(
      `https://${request.nextUrl.href.substring(7)}`
    );
  }
}
```

### 2. Headers de Segurança
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 3. Variáveis de Ambiente Seguras
```env
# Nunca commitar essas variáveis
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
ADMIN_PASSWORD=senha_super_segura
```

## 📊 Monitoramento

### 1. Sentry (Monitoramento de Erros)
```bash
npm install @sentry/nextjs
```

### 2. Google Analytics
```typescript
// pages/_app.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import * as gtag from '../lib/gtag';

const router = useRouter();
useEffect(() => {
  const handleRouteChange = (url: string) => {
    gtag.pageview(url);
  };
  router.events.on('routeChangeComplete', handleRouteChange);
  return () => {
    router.events.off('routeChangeComplete', handleRouteChange);
  };
}, [router.events]);
```

### 3. Uptime Monitoring
Use serviços como:
- **UptimeRobot**
- **Pingdom**
- **Better Uptime**

## 🔧 Configuração Final de Produção

### 1. Atualizar URLs
```env
NEXT_PUBLIC_SITE_URL=https://micangaria.com.br
```

### 2. Configurar next.config.ts
```typescript
const nextConfig = {
  images: {
    domains: ['sua-cdn.com'],
  },
  // Otimizações para produção
  experimental: {
    optimizeCss: true,
  },
  compress: true,
};
```

### 3. Script de Deploy
```json
{
  "scripts": {
    "deploy": "npm run build && vercel --prod",
    "deploy:netlify": "npm run build && netlify deploy --prod --dir=out"
  }
}
```

## ✅ Checklist Final

- [ ] Domínio registrado e DNS configurado
- [ ] SSL ativo (HTTPS)
- [ ] Stripe configurado com chaves de produção
- [ ] Webhooks do Stripe configurados
- [ ] Banco de dados em produção
- [ ] Email configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Monitoramento ativo
- [ ] Backup automático configurado
- [ ] Testes de pagamento realizados
- [ ] Google Analytics configurado

## 🆘 Suporte

Se precisar de ajuda com alguma configuração:

- **Stripe**: [docs.stripe.com](https://docs.stripe.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

**💡 Dica:** Sempre teste em ambiente de staging antes de fazer deploy em produção!
