// Script para substituir referências de next-auth por AWS Amplify em todos os arquivos API
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Função para listar todos os arquivos recursivamente
async function getAllFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getAllFiles(res) : res;
    })
  );
  return files.flat();
}

// Função para substituir o conteúdo do arquivo
async function replaceNextAuthInFile(filePath) {
  try {
    // Verificar se é um arquivo .js ou .tsx
    if (!filePath.endsWith('.js') && !filePath.endsWith('.tsx')) {
      return false;
    }

    // Ler o arquivo
    let content = await readFile(filePath, 'utf8');
    
    // Verificar se o arquivo usa next-auth
    if (!content.includes('next-auth/react') && !content.includes('next-auth')) {
      return false;
    }
    
    console.log(`Processando: ${filePath}`);
    
    // Substituir a importação do getSession
    if (content.includes("import { getSession }") || content.includes("import {getSession}")) {
      let originalContent = content;
      
      // Substituir a linha de importação
      content = content.replace(
        /import\s+[\{\s]*getSession[\s\}]+from\s+['"]next-auth\/react['"];?/g,
        "import * as AmplifyAuth from '@aws-amplify/auth';"
      );
      
      // Substituir o uso do getSession por getCurrentUser
      const sessionPattern = /const\s+session\s*=\s*await\s+getSession\(\s*\{\s*req\s*\}\s*\);/g;
      
      if (sessionPattern.test(content)) {
        content = content.replace(
          sessionPattern,
          `try {
    const user = await AmplifyAuth.getCurrentUser();
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Não autorizado' });
    }
    
    // Criar objeto de sessão compatível com o código existente
    const session = {
      user: {
        id: user.userId,
        username: user.username
      }
    };`
        );
        
        // Adicionar o catch no final do arquivo
        content = content.replace(
          /}\s*$/,
          `  } catch (authError) {
    console.error('Erro de autenticação:', authError);
    res.status(401).json({ success: false, message: 'Erro de autenticação', error: authError.message });
  }
}`
        );
      }
      
      // Verificar se houve alterações
      if (content !== originalContent) {
        await writeFile(filePath, content, 'utf8');
        console.log(`✅ Arquivo atualizado: ${filePath}`);
        return true;
      }
    }
    
    // Substituir useSession para componentes client
    if (content.includes("import { useSession }") || content.includes("import {useSession}")) {
      let originalContent = content;
      
      // Substituir a linha de importação
      content = content.replace(
        /import\s+[\{\s]*useSession[\s\}]+from\s+['"]next-auth\/react['"];?/g,
        "import { useAuthenticator } from '@aws-amplify/ui-react';"
      );
      
      // Substituir o uso do useSession por useAuthenticator
      content = content.replace(
        /const\s+[\{\s]*session[\s*,\s*data[\s\}]+\s*=\s*useSession\(\)/g,
        "const { authStatus, user } = useAuthenticator()"
      );
      
      // Verificar se houve alterações
      if (content !== originalContent) {
        await writeFile(filePath, content, 'utf8');
        console.log(`✅ Arquivo atualizado: ${filePath}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error);
    return false;
  }
}

// Função principal
async function main() {
  try {
    const apiDir = path.resolve(__dirname, '..', 'pages', 'api');
    const files = await getAllFiles(apiDir);
    
    let updatedCount = 0;
    for (const file of files) {
      if (await replaceNextAuthInFile(file)) {
        updatedCount++;
      }
    }
    
    console.log(`\nProcessamento concluído. ${updatedCount} arquivos atualizados.`);
  } catch (error) {
    console.error('Erro ao executar script:', error);
  }
}

main();
