import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

// Configuração simples e direta para o Amplify
// Usamos valores hardcoded porque já temos acesso ao arquivo aws-exports.js
// e sabemos quais são os valores corretos das credenciais

try {
  console.log('Configurando Amplify para auth com Google');
  
  // Configuração simplificada com valores conhecidos
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-2_a1b2c3d4e',
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || '1a2b3c4d5e6f7g8h9i0j1k2l3',
        loginWith: {
          email: true,
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN 
              ? `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}` 
              : 'https://mtghelper.auth.us-east-2.amazoncognito.com',
            scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: [
              'https://main.da2h2t88kn6qm.amplifyapp.com/', 
              'http://localhost:3005/', 
              'http://localhost:3004/', 
              'http://localhost:3003/', 
              'http://localhost:3001/',
              'http://localhost:3000/',
              'https://mtghelper.com/',
              'https://mtg-helper-app.vercel.app/'
            ],
            redirectSignOut: [
              'https://main.da2h2t88kn6qm.amplifyapp.com/', 
              'http://localhost:3005/', 
              'http://localhost:3004/', 
              'http://localhost:3003/',
              'http://localhost:3001/',
              'http://localhost:3000/',
              'https://mtghelper.com/',
              'https://mtg-helper-app.vercel.app/'
            ],
            responseType: 'code',
            providers: ['Google']
          }
        }
      }
    }
  });
  
  console.log('✅ Amplify configurado com sucesso');
} catch (error) {
  console.error('❌ Erro ao configurar Amplify:', error);
  
  // Mesmo em caso de erro, vamos criar uma configuração mínima para evitar quebrar o app
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: 'us-east-2_GIWZQN4d2',
          userPoolClientId: '55j5l3rcp164av86djhf9qpjch'
        }
      }
    });
    console.log('⚠️ Configuração mínima aplicada');
  } catch (e) {
    console.error('Falha total na configuração do Amplify');
  }
}

export default Amplify;