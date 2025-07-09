// Script para definir um usuário como administrador no Cognito
const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require('@aws-sdk/client-cognito-identity-provider');
const fs = require('fs');
const path = require('path');

// Carregar configuração do Amplify
const awsExportsPath = path.join(__dirname, '..', 'src', 'aws-exports.js');
const awsExportsContent = fs.readFileSync(awsExportsPath, 'utf8');
const awsExportsJson = awsExportsContent
  .replace('const awsmobile =', '')
  .replace('export default awsmobile;', '')
  .trim();

const config = JSON.parse(awsExportsJson);
const userPoolId = config.aws_user_pools_id;
const region = config.aws_project_region;

// Email do usuário que você deseja tornar administrador
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Por favor, forneça o email do usuário como argumento.');
  console.error('Exemplo: node set-admin.js usuario@exemplo.com');
  process.exit(1);
}

async function setUserAsAdmin() {
  try {
    const client = new CognitoIdentityProviderClient({ region });
    
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: userEmail,
      UserAttributes: [
        {
          Name: 'custom:role',
          Value: 'admin'
        }
      ]
    });
    
    await client.send(command);
    console.log(`Usuário ${userEmail} definido como administrador com sucesso!`);
  } catch (error) {
    console.error('Erro ao definir usuário como administrador:', error);
  }
}

setUserAsAdmin();