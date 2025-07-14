import { Amplify } from 'aws-amplify';

// Configuração simples e direta para o Amplify
// Usamos valores hardcoded porque já temos acesso ao arquivo aws-exports.js
// e sabemos quais são os valores corretos das credenciais

try {
  console.log('Configurando Amplify para auth com Google');
  
  // Configuração simplificada com valores conhecidos
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: 'us-east-2_GIWZQN4d2',
        userPoolClientId: '55j5l3rcp164av86djhf9qpjch',
        loginWith: {
          email: true,
          oauth: {
            domain: 'https://mtghelper.auth.us-east-2.amazoncognito.com',
            scopes: ['email', 'profile', 'openid'],
            redirectSignIn: [
              'https://main.da2h2t88kn6qm.amplifyapp.com/', 
              'http://localhost:3005/', 
              'http://localhost:3004/', 
              'http://localhost:3003/', 
              'http://localhost:3001/',
              'http://localhost:3000/',
              'https://mtghelper.com/'
            ],
            redirectSignOut: [
              'https://main.da2h2t88kn6qm.amplifyapp.com/', 
              'http://localhost:3005/', 
              'http://localhost:3004/', 
              'http://localhost:3003/',
              'http://localhost:3001/',
              'http://localhost:3000/',
              'https://mtghelper.com/'
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