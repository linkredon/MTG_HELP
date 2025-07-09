import { Auth } from 'aws-amplify';
import { isDemoMode, authenticateDemoUser, registerDemoUser } from './demoMode';

// Função para login
export async function signIn(email: string, password: string) {
  try {
    // Verificar se estamos em modo de demonstração
    if (isDemoMode()) {
      return authenticateDemoUser(email, password);
    }

    // Login real com Amplify Auth
    const user = await Auth.signIn(email, password);
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para registro
export async function signUp(email: string, password: string, name: string) {
  try {
    // Verificar se estamos em modo de demonstração
    if (isDemoMode()) {
      return registerDemoUser({ name, email, password });
    }

    // Registro real com Amplify Auth
    const { user } = await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name
      }
    });
    
    return {
      success: true,
      user
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
export async function confirmSignUp(email: string, code: string) {
  try {
    // Em modo de demonstração, sempre retorna sucesso
    if (isDemoMode()) {
      return { success: true };
    }

    await Auth.confirmSignUp(email, code);
    return {
      success: true
    };
  } catch (error) {
    console.error('Erro ao confirmar registro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para logout
export async function signOut() {
  try {
    // Em modo de demonstração, apenas limpa o localStorage
    if (isDemoMode()) {
      localStorage.removeItem('demo-user');
      return { success: true };
    }

    await Auth.signOut();
    return {
      success: true
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
export async function getCurrentUser() {
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

    const user = await Auth.currentAuthenticatedUser();
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}