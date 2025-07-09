import { dynamoDb, TABLES } from '@/lib/awsConfig';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body;

    // Verificar se o email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor, forneça email e senha' });
    }

    // Buscar usuário pelo email
    const params = {
      TableName: TABLES.USERS,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };
    
    const result = await dynamoDb.send(new QueryCommand(params));
    
    if (!result.Items || result.Items.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    
    const user = result.Items[0];
    
    // Verificar se a senha está correta
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'seu_segredo_jwt_muito_seguro',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    // Retornar resposta com token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        joinedAt: user.joinedAt,
        collectionsCount: user.collectionsCount,
        totalCards: user.totalCards,
        achievements: user.achievements
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ success: false, message: 'Erro ao fazer login', error: error.message });
  }
}