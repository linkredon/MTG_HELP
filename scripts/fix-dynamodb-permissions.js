const { IAMClient, AttachRolePolicyCommand, GetRolePolicyCommand, PutRolePolicyCommand } = require('@aws-sdk/client-iam');
require('dotenv').config();

// Configuração do cliente IAM
const client = new IAMClient({
  region: process.env.AMZ_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
    secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY
  }
});

// Nome da role autenticada
const AUTH_ROLE_NAME = 'amplify-mtghelp-main-e1d7b-authRole';

// Política para permissões do DynamoDB
const dynamoDbPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:BatchGetItem',
        'dynamodb:BatchWriteItem'
      ],
      Resource: [
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_users',
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections',
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks',
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_favorites',
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_users/index/*',
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections/index/*',
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks/index/*',
        'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_favorites/index/*'
      ]
    }
  ]
};

async function fixDynamoDbPermissions() {
  try {
    console.log('🔧 Corrigindo permissões do DynamoDB para a role autenticada...');
    console.log(`📋 Role: ${AUTH_ROLE_NAME}`);
    
    // Verificar se a política já existe
    try {
      await client.send(new GetRolePolicyCommand({
        RoleName: AUTH_ROLE_NAME,
        PolicyName: 'DynamoDBFullAccess'
      }));
      console.log('✅ Política DynamoDBFullAccess já existe na role');
    } catch (error) {
      if (error.name === 'NoSuchEntity') {
        console.log('❌ Política DynamoDBFullAccess não existe, criando...');
        
        // Criar a política inline
        await client.send(new PutRolePolicyCommand({
          RoleName: AUTH_ROLE_NAME,
          PolicyName: 'DynamoDBFullAccess',
          PolicyDocument: JSON.stringify(dynamoDbPolicy)
        }));
        
        console.log('✅ Política DynamoDBFullAccess criada com sucesso!');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Permissões do DynamoDB corrigidas!');
    console.log('📋 Permissões adicionadas:');
    console.log('  - GetItem, PutItem, UpdateItem, DeleteItem');
    console.log('  - Query, Scan');
    console.log('  - BatchGetItem, BatchWriteItem');
    console.log('  - Acesso a todas as tabelas MTG e seus índices');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir permissões:', error.message);
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 Solução manual:');
      console.log('1. Acesse o console AWS IAM');
      console.log('2. Vá para Roles > amplify-mtghelp-main-e1d7b-authRole');
      console.log('3. Adicione a política inline "DynamoDBFullAccess" com o conteúdo:');
      console.log(JSON.stringify(dynamoDbPolicy, null, 2));
    }
  }
}

// Executar o script
fixDynamoDbPermissions(); 