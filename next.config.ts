import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Expor variáveis de ambiente para o cliente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PRODUCTION_URL: process.env.NEXT_PUBLIC_PRODUCTION_URL,
  },
  // Redirect problematic requests to 404
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // Catch any src/ requests and return 404
        {
          source: '/src/:path*',
          destination: '/404',
        },
        // Catch any _next/src requests and return 404
        {
          source: '/_next/src/:path*',
          destination: '/404',
        },
      ],
      fallback: [],
    };
  },  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'koduoglrfzronbcgqrjc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'sandbox.melhorenvio.com.br',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'static.melhorenvio.com.br',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'melhorenvio.com.br',
        port: '',
        pathname: '/images/**',
      },
      // Google Drive hostnames otimizados
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],    // Otimizações de performance
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configurações de timeout para evitar erros
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [], // Usar remotePatterns ao invés de domains
    loader: 'default',
    // Configurações para reduzir timeout
    unoptimized: false,
  },
};

export default nextConfig;
