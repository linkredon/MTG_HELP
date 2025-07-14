#!/usr/bin/env node

/**
 * Script para diagnosticar problemas com o Cognito Hosted UI
 * 
 * Uso: node cognito-check.js
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Cores para melhor visualização
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}=== Diagnóstico de Cognito Hosted UI ===${colors.reset}\n`);

// Pegar variáveis de ambiente
const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID;
const region = process.env.NEXT_PUBLIC_REGION;
const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '';
const hostedUiDomain = process.env.NEXT_PUBLIC_HOSTED_UI_DOMAIN || '';

// Verificar se as variáveis de ambiente estão definidas
console.log(`${colors.cyan}Verificando variáveis de ambiente:${colors.reset}`);
checkEnvVar('NEXT_PUBLIC_USER_POOL_ID', userPoolId);
checkEnvVar('NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID', clientId);
checkEnvVar('NEXT_PUBLIC_REGION', region);
checkEnvVar('NEXT_PUBLIC_COGNITO_DOMAIN', cognitoDomain);
checkEnvVar('NEXT_PUBLIC_HOSTED_UI_DOMAIN', hostedUiDomain);

// Verificar URLs de domínio
console.log(`\n${colors.cyan}Verificando URLs de domínio:${colors.reset}`);

// Adicionar protocolo se necessário
const formattedCognitoDomain = formatDomain(cognitoDomain);
const formattedHostedUiDomain = formatDomain(hostedUiDomain);

// Construir URLs para teste
const loginPageUrl = `${formattedCognitoDomain}/login?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:3000`;
const oauthUrl = `${formattedCognitoDomain}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:3000&identity_provider=Google`;

console.log(`\n${colors.cyan}URLs para teste manual:${colors.reset}`);
console.log(`Página de login: ${colors.blue}${loginPageUrl}${colors.reset}`);
console.log(`Login com Google: ${colors.blue}${oauthUrl}${colors.reset}`);

// Testar conectividade com o domínio Cognito
console.log(`\n${colors.cyan}Testando conectividade com o domínio do Cognito:${colors.reset}`);
testUrl(formattedCognitoDomain)
  .then(() => {
    console.log(`${colors.green}✓ Domínio do Cognito está acessível${colors.reset}`);
    
    // Testa a página de login apenas se o domínio estiver acessível
    console.log(`\n${colors.cyan}Testando página de login:${colors.reset}`);
    return testUrl(loginPageUrl);
  })
  .then((response) => {
    if (response?.statusCode === 200) {
      console.log(`${colors.green}✓ Página de login está disponível${colors.reset}`);
    } else if (response?.statusCode) {
      console.log(`${colors.yellow}⚠ Página de login retornou status ${response.statusCode}${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}Próximos passos:${colors.reset}`);
    console.log(`1. Verifique a configuração do Cognito no AWS Console seguindo as instruções em docs/cognito-setup-guide.md`);
    console.log(`2. Teste as URLs fornecidas acima em um navegador para ver os erros específicos`);
    console.log(`3. Use a ferramenta de diagnóstico em http://localhost:3000/auth-monitor (aba "Validador OAuth")`);
  })
  .catch(error => {
    console.log(`${colors.red}✗ Erro ao testar domínio do Cognito: ${error.message}${colors.reset}`);
    
    console.log(`\n${colors.yellow}Recomendações:${colors.reset}`);
    console.log(`1. Verifique se o domínio do Cognito está configurado corretamente no AWS Console`);
    console.log(`2. Certifique-se de que o formato do domínio inclui https://`);
    console.log(`3. Verifique se há problemas de conectividade com a AWS`);
  });

// Funções auxiliares

function checkEnvVar(name, value) {
  if (!value) {
    console.log(`${colors.red}✗ ${name} não está definida${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✓ ${name}:${colors.reset} ${value}`);
  return true;
}

function formatDomain(domain) {
  if (!domain) return '';
  
  if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
    return `https://${domain}`;
  }
  
  return domain;
}

function testUrl(urlString) {
  return new Promise((resolve, reject) => {
    if (!urlString) {
      reject(new Error('URL não fornecida'));
      return;
    }
    
    try {
      const url = new URL(urlString);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.get(urlString, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);
          
          // Verificar se há erros específicos do Cognito na resposta
          if (data.includes('Login pages unavailable')) {
            console.log(`${colors.red}Erro detectado: "Login pages unavailable"${colors.reset}`);
            console.log(`${colors.yellow}Isso geralmente indica um problema de configuração no App Client do Cognito${colors.reset}`);
          }
          
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}
