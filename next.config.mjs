/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['c1.scryfall.com', 'c2.scryfall.com', 'cards.scryfall.io'],
  },
  // Desabilitar a geração de arquivos de trace
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Configurações para evitar problemas com o arquivo trace (movido da configuração experimental)
  outputFileTracingExcludes: {
    '.next': ['**/*']
  },
  // Configurações de ambiente
  env: {
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'false',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  },
  // Aumentar o tempo limite para autenticação
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: '1mb',
      },
      responseLimit: false,
    }
  },
  // Otimizações de CSS
  optimizeFonts: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    // Otimizações de CSS
    optimizeCss: true,
    // Cache mais eficiente para Next.js 15+
    serverComponentsExternalPackages: ['aws-amplify', '@aws-amplify/api', '@aws-amplify/auth'],
    // Usar AppDir em vez de pages
    appDir: true,
    // Melhor suporte para módulos ESM
    esmExternals: 'loose',
  },
  
  // Configurações de webpack para resolver problemas com AWS Amplify
  webpack: (config, { isServer }) => {
    // Resolver problemas com módulos AWS Amplify
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...(config.resolve?.fallback || {}),
        'crypto': false,
        'fs': false,
        'path': false,
      },
      alias: {
        ...(config.resolve?.alias || {}),
        './runtimeConfig': './runtimeConfig.browser',
      }
    };
    
    return config;
  },
}


// Temporariamente ignorar erros de TypeScript durante o build
nextConfig.typescript = {
  ignoreBuildErrors: true,
};

export default nextConfig;
