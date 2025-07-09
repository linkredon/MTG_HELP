// Script para verificar a configuração do User Pool
const { CognitoIdentityProviderClient, DescribeUserPoolCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Configurações
const REGION = 'us-east-2';
const USER_POOL_ID = 'us-east-2_GIWZQN4d2'; // Seu User Pool ID

// Inicializar o cliente do Cognito
const client = new CognitoIdentityProviderClient({ region: REGION });

async function checkUserPool() {
  try {
    const command = new DescribeUserPoolCommand({
      UserPoolId: USER_POOL_ID
    });

    const response = await client.send(command);
    
    console.log('Informações do User Pool:');
    console.log('=======================');
    console.log('Nome:', response.UserPool.Name);
    console.log('ID:', response.UserPool.Id);
    console.log('Status:', response.UserPool.Status);
    console.log('Criado em:', response.UserPool.CreationDate);
    
    console.log('\nPolíticas:');
    console.log('- MFA obrigatório:', response.UserPool.MfaConfiguration);
    console.log('- Verificação de email:', response.UserPool.AutoVerifiedAttributes.includes('email'));
    
    console.log('\nClientes de aplicação:');
    console.log('- Total:', response.UserPool.EstimatedNumberOfUsers);
    
    console.log('\nEsquemas:');
    response.UserPool.SchemaAttributes.forEach(attr => {
      console.log(`- ${attr.Name}: ${attr.AttributeDataType} (Obrigatório: ${attr.Required})`);
    });
    
    return response;
  } catch (error) {
    console.error('Erro ao verificar User Pool:', error);
    throw error;
  }
}

// Executar a função
checkUserPool();