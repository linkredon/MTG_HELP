// fix-google-oauth.js
const fs = require('fs');
const path = require('path');

try {
  console.log('🔧 Corrigindo configurações do Google OAuth...');
  
  // Caminho para os arquivos
  const envPath = path.join(process.cwd(), '.env.local');
  const envBackupPath = path.join(process.cwd(), '.env.local.backup');
  
  // Criar backup do arquivo original
  if (fs.existsSync(envPath)) {
    console.log('📦 Criando backup do arquivo .env.local...');
    fs.copyFileSync(envPath, envBackupPath);
    
    // Ler o conteúdo do arquivo
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Atualizar URLs de redirecionamento
    content = content.replace(
      /NEXT_PUBLIC_REDIRECT_SIGN_IN=.*/g,
      'NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/api/auth/callback/google'
    );
    
    content = content.replace(
      /NEXT_PUBLIC_REDIRECT_SIGN_OUT=.*/g,
      'NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000'
    );
    
    // Adicionar URLs específicas para OAuth se não existirem
    if (!content.includes('OAUTH_REDIRECT_SIGNIN')) {
      content += '\n\n# URLs específicas para OAuth\n';
      content += 'OAUTH_REDIRECT_SIGNIN=http://localhost:3000/api/auth/callback/google\n';
      content += 'OAUTH_REDIRECT_SIGNOUT=http://localhost:3000\n';
    }
    
    // Salvar arquivo com as correções
    fs.writeFileSync(envPath, content);
    console.log('✅ Configurações do OAuth atualizadas com sucesso!');
    
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse o Google Cloud Console: https://console.cloud.google.com/');
    console.log('2. Navegue para "APIs & Serviços" > "Credenciais"');
    console.log('3. Edite seu cliente OAuth e adicione o URI de redirecionamento:');
    console.log('   http://localhost:3000/api/auth/callback/google');
    console.log('4. Reinicie o servidor de desenvolvimento');
    console.log('\n🔍 Para mais detalhes, consulte o arquivo GOOGLE_AUTH_FIX.md');
  } else {
    console.error('❌ Arquivo .env.local não encontrado!');
  }
} catch (error) {
  console.error('❌ Erro ao atualizar configurações:', error);
}
