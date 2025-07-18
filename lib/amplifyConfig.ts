import { Amplify } from 'aws-amplify';
import { getAmplifyConfig } from './demoMode';

// Usar configurações do ambiente ou do arquivo aws-exports.js
let config;
try {
  // Tentar importar aws-exports.js se existir
  const awsconfig = require('../src/aws-exports').default;
  config = awsconfig;
} catch (e) {
  // Usar configurações do ambiente
  config = getAmplifyConfig();
}

// Remover toda chamada de Amplify.configure

export default Amplify;