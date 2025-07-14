import { dynamoDb, TABLES } from './awsConfig';

/**
 * Função para verificar a conexão com o DynamoDB
 * Esta função é usada para garantir que as credenciais da AWS estão configuradas corretamente
 */
async function dbConnect() {
  try {
    // Verificar se as variáveis de ambiente necessárias estão definidas
    if (!process.env.AMZ_REGION || !process.env.AMZ_ACCESS_KEY_ID || !process.env.AMZ_SECRET_ACCESS_KEY) {
      throw new Error(
        'Por favor, defina as variáveis de ambiente AWS_REGION, AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY'
      );
    }
    
    // Não precisamos realmente "conectar" ao DynamoDB como faríamos com o MongoDB
    // O cliente é inicializado quando importamos dynamoDb
    // Podemos apenas retornar o cliente para manter a compatibilidade com o código existente
    return { client: dynamoDb, tables: TABLES };
  } catch (error) {
    console.error('Erro ao conectar ao DynamoDB:', error);
    throw error;
  }
}

export default dbConnect;