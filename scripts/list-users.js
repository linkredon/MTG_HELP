// Script para listar todos os usuários do Cognito User Pool
const { CognitoIdentityProviderClient, ListUsersCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Configurações
const REGION = 'us-east-2'; // Região do seu User Pool
const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-2_GIWZQN4d2'; // ID do seu User Pool

// Inicializar o cliente do Cognito
const client = new CognitoIdentityProviderClient({ region: REGION });

async function listUsers() {
  try {
    const command = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 60 // Número máximo de usuários a retornar
    });

    const response = await client.send(command);
    
    console.log('Usuários registrados:');
    console.log('====================');
    
    if (response.Users && response.Users.length > 0) {
      response.Users.forEach(user => {
        const email = user.Attributes.find(attr => attr.Name === 'email')?.Value || 'N/A';
        const name = user.Attributes.find(attr => attr.Name === 'name')?.Value || 'N/A';
        const role = user.Attributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';
        const status = user.UserStatus;
        
        console.log(`Nome: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Função: ${role}`);
        console.log(`Status: ${status}`);
        console.log('--------------------');
      });
      
      console.log(`Total de usuários: ${response.Users.length}`);
    } else {
      console.log('Nenhum usuário encontrado.');
    }
    
    return response;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
}

// Executar a função
listUsers();