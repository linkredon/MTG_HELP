#!/usr/bin/env node

/**
 * Script para corrigir configurações do Cognito e resolver problemas de autenticação
 * Este script verifica e corrige as configurações necessárias para evitar erros 405
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando correção das configurações do Cognito...\n');

// Configurações corretas baseadas no log
const correctConfig = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_GIWZQN4d2',
  userPoolClientId: '55j5l3rcp164av86djhf9qpjch',
  cognitoDomain: 'https://mtghelper.auth.us-east-2.amazoncognito.com',
  identityPoolId: 'us-east-2:8681c7d7-6e0e-494f-9f0a-fe9f8d949db5',
  productionUrls: [
    'https://main.da2h2t88kn6qm.amplifyapp.com',
    'https://mtghelper.com',
    'https://www.mtghelper.com'
  ],
  localUrls: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005'
  ]
};

// Função para atualizar o arquivo amplifySetup.ts
function updateAmplifySetup() {
  const amplifySetupPath = path.join(__dirname, '..', 'lib', 'amplifySetup.ts');
  
  if (!fs.existsSync(amplifySetupPath)) {
    console.error('❌ Arquivo amplifySetup.ts não encontrado');
    return false;
  }

  let content = fs.readFileSync(amplifySetupPath, 'utf8');

  // Atualizar configurações com valores corretos
  content = content.replace(
    /const userPoolId = process\.env\.NEXT_PUBLIC_USER_POOL_ID \|\| ['"][^'"]+['"]/g,
    `const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID || '${correctConfig.userPoolId}'`
  );

  content = content.replace(
    /const userPoolClientId = process\.env\.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID \|\| ['"][^'"]+['"]/g,
    `const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || '${correctConfig.userPoolClientId}'`
  );

  content = content.replace(
    /const region = process\.env\.NEXT_PUBLIC_REGION \|\| ['"][^'"]+['"]/g,
    `const region = process.env.NEXT_PUBLIC_REGION || '${correctConfig.region}'`
  );

  content = content.replace(
    /let cognitoDomain = process\.env\.NEXT_PUBLIC_COGNITO_DOMAIN \|\| ['"][^'"]+['"]/g,
    `let cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '${correctConfig.cognitoDomain.replace('https://', '')}'`
  );

  content = content.replace(
    /const identityPoolId = process\.env\.NEXT_PUBLIC_IDENTITY_POOL_ID \|\| ['"][^'"]+['"]/g,
    `const identityPoolId = process.env.NEXT_PUBLIC_IDENTITY_POOL_ID || '${correctConfig.identityPoolId}'`
  );

  // Atualizar URLs de redirecionamento
  const productionUrlsString = correctConfig.productionUrls.map(url => `'${url}'`).join(',\n      ');
  const localUrlsString = correctConfig.localUrls.map(url => `'${url}'`).join(',\n      ');

  content = content.replace(
    /const productionUrls = \[[\s\S]*?\];/g,
    `const productionUrls = [\n      ${productionUrlsString}\n    ];`
  );

  content = content.replace(
    /const localUrls = \[[\s\S]*?\];/g,
    `const localUrls = [\n      ${localUrlsString}\n    ];`
  );

  // Adicionar logs de diagnóstico melhorados
  if (!content.includes('console.log("🔧 Diagnóstico da configuração:"))')) {
    const diagnosticLogs = `
    // Logs de diagnóstico para resolver problemas de autenticação
    console.log("🔧 Diagnóstico da configuração:");
    console.log("- Region:", region);
    console.log("- User Pool ID:", userPoolId);
    console.log("- Client ID:", userPoolClientId);
    console.log("- Cognito Domain:", cognitoDomain);
    console.log("- Identity Pool ID:", identityPoolId);
    console.log("- Production URLs:", productionUrls);
    console.log("- Local URLs:", localUrls);
    console.log("- Current URL:", typeof window !== 'undefined' ? window.location.origin : 'Server-side');
    
`;

    content = content.replace(
      /\/\/ Log de diagnóstico para depuração/g,
      `${diagnosticLogs}// Log de diagnóstico para depuração`
    );
  }

  // Salvar as alterações
  fs.writeFileSync(amplifySetupPath, content);
  console.log('✅ Arquivo amplifySetup.ts atualizado com sucesso!');
  return true;
}

// Função para criar/atualizar arquivo .env.local
function updateEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  const envContent = `# Configurações do AWS Cognito
NEXT_PUBLIC_REGION=${correctConfig.region}
NEXT_PUBLIC_USER_POOL_ID=${correctConfig.userPoolId}
NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID=${correctConfig.userPoolClientId}
NEXT_PUBLIC_COGNITO_DOMAIN=${correctConfig.cognitoDomain.replace('https://', '')}
NEXT_PUBLIC_IDENTITY_POOL_ID=${correctConfig.identityPoolId}

# URLs de redirecionamento OAuth
OAUTH_REDIRECT_SIGNIN=http://localhost:3000
OAUTH_REDIRECT_SIGNOUT=http://localhost:3000
OAUTH_REDIRECT_SIGNIN_PRODUCTION=${correctConfig.productionUrls[0]}
OAUTH_REDIRECT_SIGNOUT_PRODUCTION=${correctConfig.productionUrls[0]}

# Configurações de debug
NEXT_PUBLIC_DEBUG_AUTH=true
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local atualizado com sucesso!');
}

// Função para verificar configurações do Cognito
function checkCognitoConfig() {
  console.log('📋 Configurações que devem estar no AWS Cognito Console:');
  console.log('');
  console.log('1. User Pool ID:', correctConfig.userPoolId);
  console.log('2. App Client ID:', correctConfig.userPoolClientId);
  console.log('3. Cognito Domain:', correctConfig.cognitoDomain);
  console.log('4. Identity Pool ID:', correctConfig.identityPoolId);
  console.log('');
  console.log('📋 URLs de redirecionamento que devem estar configuradas:');
  console.log('');
  console.log('Allowed Callback URLs:');
  correctConfig.productionUrls.forEach(url => console.log(`  - ${url}`));
  correctConfig.localUrls.forEach(url => console.log(`  - ${url}`));
  console.log('');
  console.log('Allowed Sign-out URLs:');
  correctConfig.productionUrls.forEach(url => console.log(`  - ${url}`));
  correctConfig.localUrls.forEach(url => console.log(`  - ${url}`));
  console.log('');
}

// Função principal
function main() {
  try {
    console.log('🚀 Iniciando correção das configurações...\n');
    
    // Atualizar arquivos
    const setupUpdated = updateAmplifySetup();
    updateEnvFile();
    
    if (setupUpdated) {
      console.log('\n✅ Correções aplicadas com sucesso!');
      console.log('\n📋 Próximos passos necessários:');
      console.log('');
      console.log('1. Acesse o AWS Cognito Console:');
      console.log('   https://console.aws.amazon.com/cognito/');
      console.log('');
      console.log('2. Selecione seu User Pool e vá para "App integration" > "App client settings"');
      console.log('');
      console.log('3. Verifique se as seguintes configurações estão corretas:');
      checkCognitoConfig();
      console.log('4. Reinicie seu aplicativo para aplicar as novas configurações');
      console.log('');
      console.log('5. Se ainda houver problemas, verifique os logs no console do navegador');
      console.log('');
      console.log('🔧 Para testar a configuração, acesse:');
      console.log('   http://localhost:3000/auth-monitor/login-debugger');
      console.log('');
    } else {
      console.log('❌ Erro ao aplicar correções');
    }
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar o script
if (require.main === module) {
  main();
}

module.exports = { updateAmplifySetup, updateEnvFile, checkCognitoConfig }; 