// Script para testar o registro de usuário diretamente com o Cognito
const { CognitoIdentityProviderClient, SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Configurações
const REGION = 'us-east-2';
const CLIENT_ID = '55j5l3rcp164av86djhf9qpjch'; // Seu User Pool Web Client ID
const EMAIL = 'teste@exemplo.com'; // Substitua pelo email que deseja testar
const PASSWORD = 'Senha123!'; // Substitua por uma senha forte
const NAME = 'Usuário Teste';

// Inicializar o cliente do Cognito
const client = new CognitoIdentityProviderClient({ region: REGION });

async function testSignUp() {
  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: EMAIL,
      Password: PASSWORD,
      UserAttributes: [
        {
          Name: 'email',
          Value: EMAIL
        },
        {
          Name: 'name',
          Value: NAME
        }
      ]
    });

    const response = await client.send(command);
    console.log('Registro bem-sucedido!');
    console.log('UserSub:', response.UserSub);
    console.log('Usuário precisa de confirmação:', response.UserConfirmed === false);
    return response;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
}

// Executar a função
testSignUp();