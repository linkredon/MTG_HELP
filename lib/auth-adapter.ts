/**
 * Adaptador para compatibilidade entre versões do AWS Amplify
 */
import { fetchAuthSession as fetchAuthSessionAmplify, getCurrentUser } from 'aws-amplify/auth';

// Função para obter tokens de sessão e credenciais (compatibilidade)
export async function fetchAuthSession() {
  try {
    const session = await fetchAuthSessionAmplify();

    // O novo formato já traz tokens no padrão correto
    if (session && session.tokens?.idToken) {
      // Pega o usuário atual (opcional, pode ser útil para atributos extras)
      let credentials = null;
      try {
        credentials = await getCurrentUser();
      } catch {}

      return {
        tokens: {
          idToken: session.tokens.idToken,
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
        },
        credentials: credentials || null,
        identityId: session.identityId || null,
      };
    }

    return { tokens: null, credentials: null };
  } catch (error) {
    console.error('Erro ao obter sessão de autenticação:', error);
    return { tokens: null, credentials: null };
  }
}
