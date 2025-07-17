/**
 * Adaptador para compatibilidade entre versões do AWS Amplify
 */
import { Auth } from 'aws-amplify';

// Função para obter tokens de sessão e credenciais
export async function fetchAuthSession() {
  try {
    const session = await Auth.currentSession();
    
    // Extrair credenciais AWS
    if (session) {
      const credentials = await Auth.currentCredentials();
      const awsCredentials = Auth.essentialCredentials(credentials);
      
      // Montar objeto de resposta compatível
      return {
        tokens: {
          idToken: {
            jwtToken: session.getIdToken().getJwtToken(),
            payload: session.getIdToken().decodePayload()
          }
        },
        credentials: awsCredentials,
        identityId: credentials.identityId
      };
    }
    
    return { tokens: null, credentials: null };
  } catch (error) {
    console.error('Erro ao obter sessão de autenticação:', error);
    return { tokens: null, credentials: null };
  }
}
