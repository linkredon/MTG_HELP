'use client';

/**
 * Adaptador completo do Auth AWS para compatibilidade entre versões
 * Este arquivo centraliza todas as importações de autenticação do AWS Amplify
 */
import { signIn, signUp, confirmSignUp, getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

export { Amplify };

export { signIn, signUp, confirmSignUp, getCurrentUser, fetchAuthSession, signOut };

// Hub para eventos de autenticação (mantido para compatibilidade)
export const Hub = {
  listen: (channel: string, callback: (data: any) => void) => {
    if (typeof window !== 'undefined') {
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
