import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import type { UserUpdateData, User } from '@/types/user';

export async function PUT(req: NextRequest) {
  // Verificar ambiente
  const isProd = process.env.NODE_ENV === 'production';
  
  // Verificar se o usuário está autenticado
  const session = await getServerSession(authOptions);
  
  // Verificar cookies de autenticação do Amplify
  const amplifyAuth = req.cookies.get('amplify-signin-with-hostedUI')?.value;
  const amplifyTokens = req.cookies.get('amplify.auth.tokens')?.value;
  
  let temporaryUser = false;
  let amplifyUser = false;
  
  // Verificar autenticação Amplify
  if ((amplifyAuth || amplifyTokens) && (!session || !session.user)) {
    if (!isProd) console.log('API UPDATE: Autenticação Amplify detectada');
    amplifyUser = true;
    // Continuar processamento com usuário Amplify
  }
  // MODO DE EMERGÊNCIA: Permitir atualizações mesmo sem sessão autenticada
  else if (!session || !session.user) {
    if (!isProd) console.log('API UPDATE: Sessão não encontrada, usando modo temporário');
    temporaryUser = true;
    
    // Em produção, exigimos algum tipo de autenticação
    if (isProd && !amplifyUser) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária' }, 
        { status: 401 }
      );
    }
  }

  try {
    // Receber os dados da requisição
    const userData: UserUpdateData = await req.json();
    
    // Validar os dados
    if (!userData.name) {
      return NextResponse.json({ success: false, message: 'O nome é obrigatório' }, { status: 400 });
    }

    // Aqui você faria a conexão com seu banco de dados para salvar os dados
    // Como exemplo, vamos simular uma atualização bem-sucedida
    
    // Em um projeto real, você faria algo como:
    // await db.collection('users').updateOne(
    //   { email: session.user.email },
    //   { $set: { name: userData.name, nickname: userData.nickname, ... } }
    // );

    // Preparar resposta baseada no tipo de usuário
    let userResponse;
    
    if (amplifyUser) {
      // Usuário autenticado pelo Amplify
      userResponse = {
        email: req.cookies.get('amplify_email')?.value || 'usuario@mtghelper.com',
        name: userData.name,
        nickname: userData.nickname,
        avatar: userData.avatar,
        bio: userData.bio,
        theme: userData.theme,
        isAmplifyAuth: true
      };
    } else if (temporaryUser) {
      // Usuário temporário
      userResponse = {
        email: 'usuario@temporario.com',
        name: userData.name,
        nickname: userData.nickname,
        avatar: userData.avatar,
        bio: userData.bio,
        theme: userData.theme,
        isTemporary: true
      };
    } else {
      // Usuário autenticado pelo NextAuth
      userResponse = {
        ...session.user,
        name: userData.name,
        nickname: userData.nickname,
        avatar: userData.avatar,
        bio: userData.bio,
        theme: userData.theme
      };
    }
    
    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: userResponse
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
