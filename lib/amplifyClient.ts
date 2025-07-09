import { Amplify } from 'aws-amplify';
import { Auth } from '@aws-amplify/auth';
import { API } from '@aws-amplify/api';
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

Amplify.configure(config);
Auth.configure(config);
API.configure(config);

export default Amplify;