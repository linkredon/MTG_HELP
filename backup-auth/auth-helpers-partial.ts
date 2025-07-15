// importação default removida, usar apenas métodos nomeados
import { signIn as amplifySignIn, signUp as amplifySignUp, confirmSignUp as amplifyConfirmSignUp, signOut as amplifySignOut, getCurrentUser as amplifyGetCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { isDemoMode, authenticateDemoUser, registerDemoUser } from './demoMode';

// Definindo tipos para os retornos das funções de autenticação
export type AuthResult = 
  | { success: true; user: any }
  | { success: false, error: string };

// Função para login
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    // Garantir que o usuário anterior foi deslogado
  await amplifySignOut();
    localStorage.clear();

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
