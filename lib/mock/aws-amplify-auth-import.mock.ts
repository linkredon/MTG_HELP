'use client';

// Este arquivo contém mocks para as funções do @aws-amplify/auth
// que são usadas no projeto MTG_HELP

export const signInWithRedirect = async (options?: any) => {
  console.log('Mock: signInWithRedirect chamado', options);
  return { success: true };
};

export const confirmSignUp = async (username: string, code: string, options?: any) => {
  console.log('Mock: confirmSignUp chamado', { username, code, options });
  return { user: { username } };
};

export const fetchAuthSession = async () => {
  console.log('Mock: fetchAuthSession chamado');
  return {
    tokens: {
      idToken: {
        toString: () => 'mock-id-token'
      }
    }
  };
};

// Mock para importação dinâmica
const auth = {
  signIn: async (username: string, password: string) => {
    console.log('Mock: auth.signIn chamado', { username, password });
    return { isSignedIn: true };
  },
  signUp: async (options: any) => {
    console.log('Mock: auth.signUp chamado', options);
    return { isSignedUp: true };
  }
};

// Para permitir import dinâmico
export default auth;
