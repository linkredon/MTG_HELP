import { Auth } from 'aws-amplify';

// Função para login
export async function signIn(email: string, password: string) {
  try {
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