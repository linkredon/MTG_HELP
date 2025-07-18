/**
 * Arquivo de tipos para facilitar a migração entre versões do Amplify
 */

// Importamos a versão 5 do Amplify
import { Amplify } from 'aws-amplify';
// Remover: import Auth from 'aws-amplify/auth';

// Definimos tipos para funções que usamos, mas podem ter nomes diferentes entre versões
export { Amplify };

// Re-exportamos Hub com uma interface simplificada
export const Hub = {
  listen: (channel: string, callback: (data: any) => void) => {
    if (typeof window !== 'undefined') {
      // Versão simplificada que funciona com Amplify 5
      document.addEventListener(`aws-amplify-${channel}`, (event: any) => {
        callback(event.detail);
      });
      
      return () => {
        document.removeEventListener(`aws-amplify-${channel}`, callback);
      };
    }
    return () => {};
  }
};

// Função auxiliar para obter a sessão atual
export const fetchAuthSession = async () => {
  try {
    // Na versão 5, usamos Auth.currentSession()
    const session = await Amplify.Auth.currentSession();
    return {
      tokens: {
        idToken: {
          payload: session.getIdToken().decodePayload()
        }
      }
    };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return { tokens: null };
  }
};

// Função auxiliar para obter o usuário atual
export const getCurrentUser = async () => {
  try {
    // Na versão 5, usamos Auth.currentAuthenticatedUser()
    const user = await Amplify.Auth.currentAuthenticatedUser();
    return {
      username: user.username,
      userId: user.attributes.sub
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    throw error;
  }
};

// Função auxiliar para fazer logout
export const signOut = async (options?: { global?: boolean }) => {
  try {
    // Na versão 5, usamos Auth.signOut()
    return await Amplify.Auth.signOut();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};
