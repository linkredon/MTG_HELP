import { Amplify } from 'aws-amplify';
import { signIn as amplifySignIn, signUp as amplifySignUp, confirmSignUp as amplifyConfirmSignUp, signOut as amplifySignOut, getCurrentUser as amplifyGetCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { isDemoMode, authenticateDemoUser, registerDemoUser } from './demoMode';

// Definindo tipos para os retornos das funções de autenticação
export type AuthResult = 
  | { success: true; user: any }
  | { success: false; error: string };

// Função para login
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    // Verificar se estamos em modo de demonstração
    if (isDemoMode()) {
      return authenticateDemoUser(email, password);
    }

    // Login real com Amplify Auth
    const { isSignedIn, nextStep } = await amplifySignIn({ username: email, password });
    
    if (isSignedIn) {
      const userInfo = await amplifyGetCurrentUser();
      return {
        success: true,
        user: userInfo
      };
    } else {
      return {
        success: false,
        error: `Autenticação incompleta: ${nextStep.signInStep}`
      };
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para registro
export async function signUp(email: string, password: string, name: string, isAdmin: boolean = false): Promise<AuthResult> {
  try {
    console.log('Iniciando registro de usuário:', { email, name, isAdmin });
    
    // Verificar se estamos em modo de demonstração
    if (isDemoMode()) {
      console.log('Modo de demonstração ativado, usando registerDemoUser');
      return registerDemoUser({ name, email, password });
    }

    console.log('Registrando usuário com Amplify Auth...');
    
    // Registro real com Amplify Auth
    try {
      const signUpResult = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            // Adicionar atributo personalizado para administrador
            'custom:role': isAdmin ? 'admin' : 'user'
          },
          // Configurar para auto-confirmar o usuário (apenas para desenvolvimento)
          autoSignIn: true
        }
      });
      
      console.log('Resultado do registro:', signUpResult);
      const { isSignUpComplete, userId, nextStep } = signUpResult;
    
    // Verificar se o usuário precisa de confirmação
    if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      console.log('Usuário precisa confirmar o registro. Tentando auto-confirmar...');
      
      try {
        // Tentar auto-confirmar o usuário (apenas para desenvolvimento)
        await amplifyConfirmSignUp({
          username: email,
          confirmationCode: '000000' // Código fictício para tentar auto-confirmação
        });
        console.log('Auto-confirmação bem-sucedida!');
      } catch (confirmError) {
        console.log('Auto-confirmação não funcionou:', confirmError);
        
        // Tentar definir o usuário como confirmado via AWS CLI ou Admin API
        console.log('Você pode confirmar manualmente o usuário no console do AWS Cognito');
      }
    } else {
      console.log('Usuário não precisa de confirmação ou já está confirmado');
    }
    
    } catch (signUpError) {
      console.error('Erro durante o registro com Amplify:', signUpError);
      throw signUpError;
    }
    
    return {
      success: true,
      user: { userId, username: email, attributes: { email, name, 'custom:role': isAdmin ? 'admin' : 'user' } }
    };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para confirmar registro (se necessário)
export async function confirmSignUp(email: string, code: string): Promise<AuthResult> {
  try {
    // Em modo de demonstração, sempre retorna sucesso
    if (isDemoMode()) {
      return { success: true, user: null };
    }

    const { isSignUpComplete, nextStep } = await amplifyConfirmSignUp({
      username: email,
      confirmationCode: code
    });
    
    if (isSignUpComplete) {
      return {
        success: true,
        user: null
      };
    } else {
      return {
        success: false,
        error: 'Confirmação incompleta'
      };
    }
  } catch (error) {
    console.error('Erro ao confirmar registro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para logout
export async function signOut(): Promise<AuthResult> {
  try {
    // Em modo de demonstração, apenas limpa o localStorage
    if (isDemoMode()) {
      localStorage.removeItem('demo-user');
      return { success: true, user: null };
    }

    await amplifySignOut();
    return {
      success: true,
      user: null
    };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para obter usuário atual
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    // Em modo de demonstração, retorna o usuário do localStorage
    if (isDemoMode()) {
      const demoUser = localStorage.getItem('demo-user');
      if (demoUser) {
        return {
          success: true,
          user: JSON.parse(demoUser)
        };
      }
      throw new Error('Usuário não autenticado');
    }

    try {
      const userInfo = await amplifyGetCurrentUser();
      const session = await fetchAuthSession();
      
      return {
        success: true,
        user: {
          ...userInfo,
          attributes: session.tokens?.idToken?.payload || {}
        }
      };
    } catch {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}