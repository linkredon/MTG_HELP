import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dynamoDb, TABLES } from '@/lib/awsConfig';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

export async function PUT(req: NextRequest) {
  // Verificar ambiente
  const isProd = process.env.NODE_ENV === 'production';
  
  // Verificar cookies de autenticação do Amplify
  const amplifyAuth = req.cookies.get('amplify-signin-with-hostedUI')?.value;
  const amplifyTokens = req.cookies.get('amplify.auth.tokens')?.value;
  
  let amplifyUser = false;
  let userEmail = '';
  
  // Verificar autenticação Amplify
  if (amplifyAuth || amplifyTokens) {
    if (!isProd) console.log('API CHANGE PASSWORD: Autenticação Amplify detectada');
    amplifyUser = true;
    
    // Extrair email do token
    try {
      if (amplifyTokens) {
        const tokensObj = JSON.parse(amplifyTokens);
        if (tokensObj.idToken?.payload?.email) {
          userEmail = tokensObj.idToken.payload.email;
        }
      }
    } catch (e) {
      console.error('Erro ao analisar token Amplify:', e);
    }
  } else {
    if (!isProd) console.log('API CHANGE PASSWORD: Autenticação não encontrada');
    
    // Em produção, exigimos autenticação
    if (isProd) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária' }, 
        { status: 401 }
      );
    }
  }

  try {
    // Receber os dados da requisição
    const { currentPassword, newPassword } = await req.json();
    
    // Validar os dados
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Senha atual e nova senha são obrigatórias' 
      }, { status: 400 });
    }

    // Validar a nova senha
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        success: false, 
        message: 'A nova senha deve ter pelo menos 8 caracteres' 
      }, { status: 400 });
    }

    if (amplifyUser && userEmail) {
      // Buscar usuário no DynamoDB para verificar senha atual
      const getParams = {
        TableName: TABLES.USERS,
        Key: {
          id: userEmail,
          email: userEmail
        }
      };
      
      const userResult = await dynamoDb.send(new GetCommand(getParams));
      
      if (!userResult.Item) {
        return NextResponse.json({ 
          success: false, 
          message: 'Usuário não encontrado' 
        }, { status: 404 });
      }
      
      // Verificar se a senha atual está correta
      const hashedCurrentPassword = userResult.Item.password;
      if (hashedCurrentPassword) {
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, hashedCurrentPassword);
        if (!isCurrentPasswordValid) {
          return NextResponse.json({ 
            success: false, 
            message: 'Senha atual incorreta' 
          }, { status: 400 });
        }
      }
      
      // Hash da nova senha
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Atualizar senha no DynamoDB
      const updateParams = {
        TableName: TABLES.USERS,
        Key: {
          id: userEmail,
          email: userEmail
        },
        UpdateExpression: 'SET #password = :password, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#password': 'password',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':password': hashedNewPassword,
          ':updatedAt': new Date().toISOString()
        }
      };
      
      await dynamoDb.send(new UpdateCommand(updateParams));
      
      return NextResponse.json({
        success: true,
        message: 'Senha alterada com sucesso',
        isAmplifyAuth: amplifyUser
      });
      
    } else {
      // Usuário temporário - simular alteração de senha
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      return NextResponse.json({
        success: true,
        message: 'Senha alterada com sucesso (modo temporário)',
        isAmplifyAuth: false
      });
    }
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
} 