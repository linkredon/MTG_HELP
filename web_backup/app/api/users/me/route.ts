import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/types/user';
import { dynamoDb, TABLES } from '@/lib/awsConfig';
import { GetCommand, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export async function GET(req: NextRequest) {
  // Verificar ambiente
  const isProd = process.env.NODE_ENV === 'production';
  
  // Verificar cookies de autenticação do Amplify
  const amplifyAuth = req.cookies.get('amplify-signin-with-hostedUI')?.value;
  const amplifyTokens = req.cookies.get('amplify.auth.tokens')?.value;
  
  // Se temos tokens do Amplify, buscar dados reais do DynamoDB
  if (amplifyAuth || amplifyTokens) {
    if (!isProd) console.log('API ME: Autenticação Amplify detectada, buscando dados do DynamoDB');
    
    try {
      // Extrair email do token
      let email = 'usuario@mtghelper.com';
      let username = 'Usuário Amplify';
      let role = 'user';
      
      if (amplifyTokens) {
        const tokensObj = JSON.parse(amplifyTokens);
        if (tokensObj.username) {
          username = tokensObj.username;
        }
        
        if (tokensObj.idToken?.payload) {
          if (tokensObj.idToken.payload.email) {
            email = tokensObj.idToken.payload.email;
          }
          if (tokensObj.idToken.payload['custom:role']) {
            role = tokensObj.idToken.payload['custom:role'];
          }
        }
      }
      
      // Buscar usuário no DynamoDB
      const params = {
        TableName: TABLES.USERS,
        Key: {
          id: email, // Usar email como ID
          email: email
        }
      };
      
      const result = await dynamoDb.send(new GetCommand(params));
      
      if (result.Item) {
        // Usuário encontrado no DynamoDB
        return NextResponse.json({
          success: true,
          user: {
            id: result.Item.id,
            name: result.Item.name || username,
            email: result.Item.email,
            nickname: result.Item.nickname || username,
            avatar: result.Item.avatar || '/default-avatar.png',
            bio: result.Item.bio || '',
            theme: result.Item.theme || 'dark',
            collectionsCount: result.Item.collectionsCount || 0,
            totalCards: result.Item.totalCards || 0,
            role: result.Item.role || role,
            isAmplifyAuth: true
          }
        });
      } else {
        // Usuário não encontrado, criar novo usuário
        const newUser = {
          id: email,
          email: email,
          name: username,
          nickname: username,
          avatar: '/default-avatar.png',
          bio: '',
          theme: 'dark',
          collectionsCount: 0,
          totalCards: 0,
          role: role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Salvar novo usuário no DynamoDB
        const putParams = {
          TableName: TABLES.USERS,
          Item: newUser
        };
        
        await dynamoDb.send(new PutCommand(putParams));
        
        return NextResponse.json({
          success: true,
          user: {
            ...newUser,
            isAmplifyAuth: true
          }
        });
      }
      
    } catch (error) {
      console.error('Erro ao buscar usuário no DynamoDB:', error);
      
      // Em caso de erro, retornar dados básicos
      return NextResponse.json({
        success: true,
        user: {
          name: 'Usuário Amplify',
          email: 'usuario@mtghelper.com',
          nickname: 'Usuário Amplify',
          avatar: '/default-avatar.png',
          bio: '',
          theme: 'dark',
          collectionsCount: 0,
          totalCards: 0,
          role: 'user',
          isAmplifyAuth: true
        }
      });
    }
  }
  
  // MODO DE EMERGÊNCIA: Se não tiver autenticação, criar uma sessão demo
  if (!isProd) console.log('API ME: Autenticação não encontrada, criando sessão de emergência');
    
  // Verificar modo de demonstração nos cookies
  const demoMode = req.cookies.get('NEXT_PUBLIC_DEMO_MODE')?.value === 'true';
  
  // Retornar usuário de emergência para evitar loops de redirecionamento
  return NextResponse.json({
    success: true,
    user: {
      name: isProd ? 'Visitante' : 'Usuário Temporário',
      email: 'usuario@temporario.com',
      nickname: isProd ? 'Visitante' : 'Temp',
      avatar: '/default-avatar.png',
      bio: isProd ? 'Faça login para personalizar seu perfil.' : 'Este é um perfil temporário para diagnóstico.',
      theme: 'dark',
      collectionsCount: 0,
      totalCards: 0,
      role: 'user',
      isTemporary: true,
      demoMode: demoMode,
      isProd: isProd
    }
  });
}
