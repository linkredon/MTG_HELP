import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

// Configuração simples e direta para o Amplify
// Usamos valores hardcoded como fallback, mas preferimos as variáveis de ambiente

// Remover toda chamada de Amplify.configure

export default Amplify;