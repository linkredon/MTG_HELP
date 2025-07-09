import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Configurar o Amplify
Amplify.configure(awsconfig);

export default Amplify;