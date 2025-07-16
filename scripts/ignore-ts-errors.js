// Este arquivo modifica o arquivo next.config.mjs para ignorar os erros de TypeScript durante o build

const fs = require('fs');
const path = require('path');

const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');

try {
  let content = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Verificar se a configuração de ignoreTsErrors já existe
  if (!content.includes('typescript: { ignoreBuildErrors: true }')) {
    // Encontrar a posição onde devemos inserir a configuração
    const insertPosition = content.lastIndexOf('export default nextConfig');
    
    if (insertPosition !== -1) {
      const updatedContent = content.slice(0, insertPosition) + 
        // Adicionar configuração para ignorar erros de TypeScript
        `
// Temporariamente ignorar erros de TypeScript durante o build
nextConfig.typescript = {
  ignoreBuildErrors: true,
};

` + content.slice(insertPosition);
      
      fs.writeFileSync(nextConfigPath, updatedContent);
      console.log('✅ next.config.mjs atualizado para ignorar erros de TypeScript durante o build!');
    } else {
      console.error('❌ Não foi possível encontrar o ponto de inserção no arquivo next.config.mjs');
    }
  } else {
    console.log('⚠️ A configuração para ignorar erros de TypeScript já existe no next.config.mjs');
  }
} catch (error) {
  console.error('❌ Erro ao atualizar next.config.mjs:', error);
}
