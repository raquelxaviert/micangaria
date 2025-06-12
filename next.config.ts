import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,  // Evitar que API routes sejam executadas durante o build
  serverExternalPackages: ['@supabase/supabase-js'],
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
    ],
  },
};

export default nextConfig;
