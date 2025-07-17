// Script para corrigir importações nos arquivos de API
const fs = require('fs');
const path = require('path');

// Diretório dos arquivos de API
const apiDir = path.resolve(__dirname, '..', 'pages', 'api');

// Função para processar um arquivo
function processFile(filePath) {
  console.log(`Verificando ${filePath}...`);
  
  // Ler o conteúdo do arquivo
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Substituir importações do AWS Amplify
  const originalContent = content;
  content = content.replace(
    /import\s+\*\s+as\s+AmplifyAuth\s+from\s+['"]@aws-amplify\/auth['"]/g,
    "import * as AmplifyAuth from '@/lib/aws-auth-adapter'"
  );
  
  // Se o conteúdo foi alterado, salvar o arquivo
  if (content !== originalContent) {
    console.log(`Corrigindo importações em ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Função recursiva para percorrer diretórios
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Se for um diretório, processar recursivamente
      count += processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      // Se for um arquivo JavaScript ou TypeScript, processar
      if (processFile(filePath)) {
        count++;
      }
    }
  });
  
  return count;
}

// Iniciar processamento
console.log('Corrigindo importações nos arquivos de API...');
const count = processDirectory(apiDir);
console.log(`Concluído! ${count} arquivos foram atualizados.`);
