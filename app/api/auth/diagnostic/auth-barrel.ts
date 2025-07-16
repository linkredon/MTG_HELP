// Este arquivo serve como um barrel file para facilitar a importação dos módulos auth e fallbackAuth
// Versão modificada para não causar problemas de build no AWS Amplify
import { authOptions, getUserById, registerUser } from '../../../../lib/auth';
import { fallbackAuthOptions } from '../../../../lib/fallbackAuth';

export { authOptions, fallbackAuthOptions, getUserById, registerUser };
