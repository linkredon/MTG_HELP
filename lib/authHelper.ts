import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

// Helper function to get user information from Amplify Auth
export async function getUserSession() {
  try {
    // Get the current authenticated user
    const currentUser = await getCurrentUser();
    const session = await fetchAuthSession();
    
    if (!session?.tokens?.idToken) {
      return null;
    }
    
    // Get user information from the ID token
    const idToken = session.tokens.idToken;
    const payload = idToken.payload;
    
    return {
      user: {
        id: currentUser.userId,
        email: payload.email as string,
        name: (payload.name as string) || (payload.email as string)?.split('@')[0],
        image: payload.picture as string || null
      },
      accessToken: session.tokens.accessToken.toString(),
      idToken: session.tokens.idToken.toString()
    };
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}
