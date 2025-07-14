/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['c1.scryfall.com', 'c2.scryfall.com', 'cards.scryfall.io'],
  },
  // Desabilitar a geração de arquivos de trace
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Garantir que as APIs de autenticação funcionem corretamente
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    }
  },
  // Pacotes externos para componentes de servidor
  serverExternalPackages: ['next-auth'],
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
  }
};