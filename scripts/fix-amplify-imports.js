'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios a serem verificados
const rootDir = path.resolve(__dirname, '..');
const dirsToCheck = ['app', 'components', 'contexts', 'lib', 'utils'];

// Padrões de importação para substituir
const importPatterns = [
  {
    pattern: /from\s+['"](aws-amplify\/auth)['"]/g,
    replacement: "from '@/lib/aws-auth-adapter'"
  },
  {
    pattern: /from\s+['"](aws-amplify\/api)['"]/g,
    replacement: "from '@/lib/aws-api-adapter'"
  },
  {
    pattern: /from\s+['"](aws-amplify\/utils)['"]/g,
    replacement: "from '@/lib/aws-auth-adapter'" // Hub está incluído no auth-adapter
  }
];

// Função para substituir importações em um arquivo
function processFile(filePath) {
  // Ignorar node_modules, arquivos em diretórios de backup, etc.
  if (filePath.includes('node_modules') || 
      filePath.includes('removed-auth-backup') || 
      filePath.includes('.next')) {
    return false;
  }
  
  // Verificar extensão do arquivo
  const ext = path.extname(filePath).toLowerCase();
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return false;
  }
  
  let fileContent = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Verificar e substituir os padrões de importação
  for (const pattern of importPatterns) {
    if (pattern.pattern.test(fileContent)) {
      fileContent = fileContent.replace(pattern.pattern, pattern.replacement);
      modified = true;
      console.log(`Corrigida importação em: ${filePath}`);
    }
  }
  
  // Salvar o arquivo se houver alterações
  if (modified) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    return true;
  }
  
  return false;
}

// Função para buscar arquivos recursivamente
function walkDirectory(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursivamente buscar arquivos em subdiretórios
      results = results.concat(walkDirectory(filePath));
    } else {
      results.push(filePath);
    }
  });
  
  return results;
}

// Processar todos os diretórios
let totalModified = 0;
dirsToCheck.forEach(dir => {
  const fullDir = path.join(rootDir, dir);
  if (fs.existsSync(fullDir)) {
    const files = walkDirectory(fullDir);
    files.forEach(file => {
      if (processFile(file)) {
        totalModified++;
      }
    });
  }
});

console.log(`Total de arquivos modificados: ${totalModified}`);
console.log('Verificação e correção de importações concluídas!');
