// fix-oauth-urls.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

try {
  console.log('🔍 Iniciando diagnóstico e correção de URLs OAuth...');
  
  // Caminhos dos arquivos
  const amplifySetupPath = path.join(process.cwd(), 'lib', 'amplifySetup.ts');
  const backupPath = path.join(process.cwd(), 'lib', 'amplifySetup.ts.backup');
  
  // Fazer backup do arquivo original
  if (fs.existsSync(amplifySetupPath)) {
    console.log('📦 Criando backup do arquivo amplifySetup.ts...');
    fs.copyFileSync(amplifySetupPath, backupPath);
    
    // Ler o conteúdo do arquivo
    let content = fs.readFileSync(amplifySetupPath, 'utf8');
    
    // Atualizar a URL de produção (corrigir typo no domain)
    console.log('🔧 Verificando e corrigindo URLs de redirecionamento...');
    
    // Corrigir a URL base (se tiver typo)
    content = content.replace(
      /process\.env\.NEXT_PUBLIC_PRODUCTION_URL \|\| 'https:\/\/main\.da2h2t88kn6qm\.amplifyapp\.com'/g,
      "process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://main.da2h2t88kn6qm.amplifyapp.com'"
    );
    
    // Corrigir o array productionUrls para garantir URL correta
    const correctProductionUrl = 'https://main.da2h2t88kn6qm.amplifyapp.com';
    
    // Verificar se há alguma URL errada no array productionUrls
    if (content.includes('da2ht88kn6qm.amplifyapp.com')) {
      console.log('⚠️ Encontrado typo na URL: da2ht88kn6qm → da2h2t88kn6qm');
      content = content.replace(
        /['"]https:\/\/main\.da2ht88kn6qm\.amplifyapp\.com['"]/g,
        `'${correctProductionUrl}'`
      );
    }
    
    // Garantir que a URL correta esteja no array productionUrls
    if (!content.includes(correctProductionUrl)) {
      console.log('⚠️ URL de produção correta não encontrada, adicionando-a...');
      content = content.replace(
        /const productionUrls = \[([\s\S]*?)\];/m,
        `const productionUrls = [\n      '${correctProductionUrl}',\n$1];`
      );
    }
    
    // Garantir HTTPS no domínio do Cognito
    content = content.replace(
      /let cognitoDomain = process\.env\.NEXT_PUBLIC_COGNITO_DOMAIN \|\| ['"]([^'"]+)['"]/g,
      "let cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'mtghelper.auth.us-east-2.amazoncognito.com'"
    );
    
    // Garantir que estamos usando o formato certo para o domínio Cognito
    content = content.replace(
      /if \(!cognitoDomain\.startsWith\('https:\/\/'\)\) {/g,
      "// Garantir que o domínio sempre use https://\nif (!cognitoDomain.startsWith('https://')) {"
    );
    
    // Adicionar log de diagnóstico para ajudar a depurar
    if (!content.includes('console.log("URLs de redirecionamento:")) {')) {
      // Adicionar logs para mostrar URLs configuradas
      const logCode = `
    // Log de diagnóstico para depuração
    console.log("URLs de redirecionamento:");
    console.log("- SignIn:", redirectSignIn);
    console.log("- SignOut:", redirectSignOut);
    console.log("- URL Base:", baseUrl);
    console.log("- Domínio Cognito:", cognitoDomain);
    
`;
      
      content = content.replace(
        /\/\/ Aplicar configuração/g,
        `${logCode}// Aplicar configuração`
      );
    }
    
    // Salvar as alterações
    fs.writeFileSync(amplifySetupPath, content);
    console.log('✅ Arquivo amplifySetup.ts atualizado com sucesso!');
    
    // Instruções para o usuário
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse o AWS Cognito Console: https://console.aws.amazon.com/cognito/');
    console.log('2. Selecione seu User Pool e vá para "App integration" > "App client settings"');
    console.log(`3. Verifique se a URL "${correctProductionUrl}" está nas URLs de Callback e Sign out`);
    console.log('4. Reinicie seu aplicativo para aplicar as novas configurações');
    console.log('\n⚠️ IMPORTANTE: Se estiver usando o AWS Amplify Hosting, você também precisará:');
    console.log('1. Ir para o console do AWS Amplify');
    console.log('2. Selecionar seu app > Redeployment > Redeploy');
    
  } else {
    console.error('❌ Arquivo amplifySetup.ts não encontrado!');
  }
} catch (error) {
  console.error('❌ Erro ao atualizar configurações:', error);
  console.error(error);
}
