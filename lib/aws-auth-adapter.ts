'use client';

/**
 * Adaptador completo do Auth AWS para compatibilidade entre versões
 * Este arquivo centraliza todas as importações de autenticação do AWS Amplify
 */
import { Auth, Amplify } from 'aws-amplify';

// Exportar os principais componentes para uso direto
export { Auth, Amplify };

// Aliases para compatibilidade com formato aws-amplify/auth
export const signIn = async (username: string, password: string) => {
  return await Auth.signIn(username, password);
};

export const signUp = async (params: {
  username: string;
  password: string;
  attributes?: Record<string, string>;
  autoSignIn?: boolean;
  options?: {
    userAttributes?: Record<string, string>;
  };
}) => {
  // Adaptar a interface entre versões
  return await Auth.signUp({
    username: params.username,
    password: params.password,
    attributes: params.options?.userAttributes || params.attributes || {}
  });
};

export const confirmSignUp = async (username: string, code: string) => {
  return await Auth.confirmSignUp(username, code);
};

export const resendSignUp = async (username: string) => {
  return await Auth.resendSignUp(username);
};

export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return {
      username: user.username,
      userId: user.attributes.sub || user.username
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    throw error;
  }
};

export const fetchUserAttributes = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user.attributes || {};
  } catch (error) {
    console.error('Erro ao obter atributos do usuário:', error);
    throw error;
  }
};

export const fetchAuthSession = async () => {
  try {
    const session = await Auth.currentSession();
    return {
      tokens: {
        idToken: {
          jwtToken: session.getIdToken().getJwtToken(),
          payload: session.getIdToken().decodePayload()
        }
      }
    };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return { tokens: null };
  }
};

export const signOut = async (options?: { global?: boolean }) => {
  try {
    return await Auth.signOut();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

// Hub para eventos de autenticação
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
