/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['c1.scryfall.com', 'c2.scryfall.com', 'cards.scryfall.io'],
  },
  // Desabilitar a geração de arquivos de trace
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Configurações para evitar problemas com o arquivo trace
  experimental: {
    outputFileTracingIgnores: ['.next/**/*'],
  },
}

module.exports = nextConfig