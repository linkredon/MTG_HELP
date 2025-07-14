#!/usr/bin/env node

/**
 * Script para resolução de problemas de autenticação
 * 
 * Este script verifica a configuração do seu ambiente para o AWS Cognito,
 * foca especificamente no erro "Login pages unavailable" e ajuda a identificar
 * problemas no Cognito App Client.
 * 
 * Uso: node scripts/fix-auth-issues.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Cores para melhor visualização
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

console.log(`${colors.blue}${colors.bold}===== SOLUCIONADOR DE PROBLEMAS DE AUTENTICAÇÃO =====${colors.reset}\n`);

// Variáveis e arquivos a serem verificados
const requiredEnvVars = [
  'NEXT_PUBLIC_REGION',
  'NEXT_PUBLIC_USER_POOL_ID',
  'NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID',
  'NEXT_PUBLIC_COGNITO_DOMAIN',
  'NEXT_PUBLIC_HOSTED_UI_DOMAIN'
];

const keyFiles = [
  { path: '.env.local', description: 'Variáveis de ambiente' },
  { path: 'amplify/backend.ts', description: 'Configuração do Amplify' },
  { path: 'app/login/page.tsx', description: 'Página de login' },
  { path: 'lib/amplifySetup.ts', description: 'Configuração do Amplify' }
];

async function main() {
  try {
    // Verificar variáveis de ambiente
    console.log(`${colors.cyan}${colors.bold}Verificando variáveis de ambiente${colors.reset}`);
    const envProblems = checkEnvironmentVariables();

    // Verificar arquivos principais
    console.log(`\n${colors.cyan}${colors.bold}Verificando arquivos principais${colors.reset}`);
    await checkKeyFiles();

    // Verificar e corrigir formato do domínio
    console.log(`\n${colors.cyan}${colors.bold}Verificando formato do domínio${colors.reset}`);
    await checkDomainFormat();

    // Mostrar diagnóstico do erro "Login pages unavailable"
    console.log(`\n${colors.cyan}${colors.bold}Diagnóstico do erro "Login pages unavailable"${colors.reset}`);
    showLoginPagesUnavailableHelp();

    // Resumo dos problemas
    console.log(`\n${colors.yellow}${colors.bold}RESUMO DOS PROBLEMAS${colors.reset}`);
    if (envProblems.length > 0) {
      console.log(`${colors.red}✗ Problemas encontrados nas variáveis de ambiente${colors.reset}`);
      console.log(`  Execute o script novamente após corrigir os problemas acima.`);
    } else {
      console.log(`${colors.green}✓ Configuração do ambiente está correta${colors.reset}`);
      console.log(`  Se ainda estiver enfrentando problemas, verifique a configuração no AWS Console.`);
    }

    // Próximos passos
    console.log(`\n${colors.blue}${colors.bold}PRÓXIMOS PASSOS${colors.reset}`);
    console.log(`1. Verifique a configuração do App Client no AWS Console seguindo as instruções em docs/cognito-setup-guide.md`);
    console.log(`2. Inicie o servidor com ${colors.bold}npm run dev${colors.reset} e acesse http://localhost:3000/auth-monitor/dashboard`);
    console.log(`3. Use as ferramentas de diagnóstico disponíveis para testar sua configuração`);

  } catch (error) {
    console.error(`${colors.red}Erro durante a execução do script:${colors.reset}`, error);
  }
}

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  const problems = [];

  console.log(`Verificando a presença e formato das variáveis de ambiente necessárias:`);
  
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    
    if (!value) {
      console.log(`${colors.red}✗ ${varName}${colors.reset}: Não encontrada`);
      problems.push(`Variável ${varName} não está definida no arquivo .env.local`);
    } else {
      console.log(`${colors.green}✓ ${varName}${colors.reset}: ${value}`);
      
      // Verificações específicas
      if (varName.includes('DOMAIN') && !value.startsWith('https://')) {
        console.log(`  ${colors.yellow}⚠ Domínio deve começar com https://${colors.reset}`);
        problems.push(`Variável ${varName} deve começar com https://`);
      }
    }
  }
  
  return problems;
}

// Verificar arquivos principais
async function checkKeyFiles() {
  for (const file of keyFiles) {
    try {
      await readFile(file.path, 'utf8');
      console.log(`${colors.green}✓ ${file.path}${colors.reset}: Encontrado`);
    } catch (error) {
      console.log(`${colors.red}✗ ${file.path}${colors.reset}: Não encontrado`);
    }
  }
}

// Verificar e corrigir formato do domínio
async function checkDomainFormat() {
  try {
    const envPath = '.env.local';
    const envContent = await readFile(envPath, 'utf8');
    let updatedContent = envContent;
    let madeChanges = false;
    
    // Procurar por domínios sem https://
    const domainVars = ['NEXT_PUBLIC_COGNITO_DOMAIN', 'NEXT_PUBLIC_HOSTED_UI_DOMAIN', 'OAUTH_DOMAIN'];
    
    for (const varName of domainVars) {
      const regex = new RegExp(`${varName}=([^\\s#]+)`, 'g');
      const match = regex.exec(envContent);
      
      if (match && match[1] && !match[1].startsWith('https://')) {
        const oldValue = match[1];
        const newValue = `https://${oldValue}`;
        
        console.log(`${colors.yellow}⚠ ${varName}${colors.reset}: Valor atual não começa com https://`);
        
        // Perguntar se deve corrigir
        console.log(`  Valor antigo: ${oldValue}`);
        console.log(`  Valor novo:   ${newValue}`);
        
        // Atualizar o conteúdo
        updatedContent = updatedContent.replace(
          `${varName}=${oldValue}`,
          `${varName}=${newValue}`
        );
        
        madeChanges = true;
        console.log(`  ${colors.green}✓ Modificado para incluir https://${colors.reset}`);
      }
    }
    
    // Salvar as alterações se necessário
    if (madeChanges) {
      await writeFile(envPath, updatedContent, 'utf8');
      console.log(`${colors.green}✓ Arquivo .env.local atualizado com sucesso${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Todos os domínios já estão corretamente formatados com https://${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Erro ao verificar/corrigir formatos de domínio:${colors.reset}`, error);
  }
}

// Mostrar ajuda para o erro "Login pages unavailable"
function showLoginPagesUnavailableHelp() {
  console.log(`${colors.yellow}Se você está vendo o erro "Login pages unavailable", verifique:${colors.reset}`);
  
  console.log(`\n${colors.bold}1. Verifique a configuração do App Client no AWS Console:${colors.reset}`);
  console.log(`   - Acesse https://console.aws.amazon.com/cognito/users/`);
  console.log(`   - Selecione seu User Pool (${process.env.NEXT_PUBLIC_USER_POOL_ID || 'ID não encontrado'})`);
  console.log(`   - Na barra lateral, clique em "App integration"`);
  console.log(`   - Role até "App clients and analytics"`);
  console.log(`   - Verifique se "Use Cognito Hosted UI" está HABILITADO`);
  console.log(`   - Certifique-se de que "Google" está selecionado em "Identity providers"`);
  
  console.log(`\n${colors.bold}2. Verifique as URLs de redirecionamento:${colors.reset}`);
  console.log(`   - Na mesma tela de App Client, verifique "Allowed callback URLs"`);
  console.log(`   - Certifique-se de que inclui:`);
  console.log(`     * http://localhost:3000 (para desenvolvimento local)`);
  console.log(`     * https://seu-domínio-de-produção.com (para produção)`);
  
  console.log(`\n${colors.bold}3. Verifique o tipo de concessão OAuth:${colors.reset}`);
  console.log(`   - Em "OAuth 2.0 grant types", verifique se "Authorization code grant" está selecionado`);
  console.log(`   - Em "OpenID Connect scopes", verifique se pelo menos "email", "openid" e "profile" estão selecionados`);
  
  console.log(`\n${colors.bold}4. Verifique a configuração de domínio:${colors.reset}`);
  console.log(`   - Na barra lateral, clique em "App integration" e role até "Domain"`);
  console.log(`   - Certifique-se de que um domínio está configurado e corresponde ao valor em .env.local`);
}

// Executar o script
main();
