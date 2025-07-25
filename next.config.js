/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c1.scryfall.com',
      },
      {
        protocol: 'https',
        hostname: 'c2.scryfall.com',
      },
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
      {
        protocol: 'https',
        hostname: 'api.scryfall.com',
      },
    ],
  },
  // Desabilitar a geração de arquivos de trace
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Garantir que as APIs de autenticação funcionem corretamente
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'localhost:3001', 
        'localhost:3002',
        'main.da2h2t88kn6qm.amplifyapp.com',
        'mtghelper.com',
        '*.mtghelper.com'
      ]
    }
    // Removido esmExternals conforme recomendado pelo Next.js
  },
  // Pacotes externos para componentes de servidor
  serverExternalPackages: ['aws-amplify', '@aws-amplify/api', '@aws-amplify/auth'],
  // Configurações de webpack
  webpack: (config, { isServer }) => {
    // Resolver problemas com módulos AWS Amplify
    config.resolve.alias = {
      ...config.resolve.alias,
      './runtimeConfig': './runtimeConfig.browser',
    };
    
    // Ignorar erros específicos relacionados a alguns módulos
    config.ignoreWarnings = [
      { module: /node_modules\/@aws-amplify\/data-schema-types/ },
      { module: /node_modules\/aws-amplify/ }
    ];

    // Adiciona configurações para lidar com módulos ESM (substitui o esmExternals)
    if (isServer) {
      const nextMajor = parseInt(process.versions.node.split('.')[0], 10) >= 12;
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };

      // Compatibilidade com AWS Amplify
      config.externals = [...(config.externals || []), 'aws-crt'];
    }

    return config;
  },
}

module.exports = {
  ...nextConfig,
  outputFileTracingExcludes: {
    '.next': ['**/*']
  },
  // Configurações para lidar com problemas de renderização
  reactStrictMode: false,
  compiler: {
    styledComponents: true
  },
  // Movendo configuração do Babel para next.config.js
  transpilePackages: ['@aws-amplify'],
};