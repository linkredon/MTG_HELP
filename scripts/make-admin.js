// Script para promover um usuário a administrador
const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Configurações
const REGION = 'us-east-2'; // Região do seu User Pool
const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-2_GIWZQN4d2'; // ID do seu User Pool
const USER_EMAIL = process.argv[2]; // Email do usuário a ser promovido

if (!USER_EMAIL) {
  console.error('Por favor, forneça o email do usuário: node make-admin.js email@exemplo.com');
  process.exit(1);
}

// Inicializar o cliente do Cognito
const client = new CognitoIdentityProviderClient({ region: REGION });

async function makeUserAdmin() {
  try {
    // Definir o atributo personalizado 'custom:role' como 'admin'
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: USER_EMAIL,
      UserAttributes: [
        {
          Name: 'custom:role',
          Value: 'admin'
        }
      ]
    });

    // Executar o comando
    const response = await client.send(command);
    console.log(`Usuário ${USER_EMAIL} promovido a administrador com sucesso!`);
    return response;
  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    throw error;
  }
}

// Executar a função
makeUserAdmin();