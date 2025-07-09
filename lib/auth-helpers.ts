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
export async function signUp(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    // Verificar se estamos em modo de demonstração
    if (isDemoMode()) {
      return registerDemoUser({ name, email, password });
    }

    // Registro real com Amplify Auth
    const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name
        },
        // Configurar para auto-confirmar o usuário (apenas para desenvolvimento)
        autoSignIn: true
      }
    });
    
    // Tentar auto-confirmar o usuário (apenas para desenvolvimento)
    try {
      await amplifyConfirmSignUp({
        username: email,
        confirmationCode: '000000' // Código fictício para tentar auto-confirmação
      });
    } catch (confirmError) {
      console.log('Auto-confirmação não funcionou, mas isso é esperado');
    }
    
    return {
      success: true,
      user: { userId, username: email, attributes: { email, name } }
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