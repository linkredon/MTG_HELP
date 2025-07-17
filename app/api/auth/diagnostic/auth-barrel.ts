// Este arquivo serve como um barrel file para facilitar a importação dos módulos auth
// Versão atualizada usando apenas AWS Amplify/Cognito
import { getUserById, registerUser } from '../../../../lib/auth-amplify';
import { fallbackAuthOptions } from '../../../../lib/fallbackAuth';

// Exporta as funções do AWS Amplify
export { fallbackAuthOptions, getUserById, registerUser };
