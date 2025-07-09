import { Amplify } from 'aws-amplify';
import { getAmplifyConfig } from './demoMode';

// Usar configurações do ambiente ou do arquivo aws-exports.js
let config;
try {
  // Tentar importar aws-exports.js se existir
  const awsconfig = require('../src/aws-exports').default;
  config = awsconfig;
  console.log('Usando configurações do aws-exports.js');
} catch (e) {
  // Usar configurações do ambiente
  config = getAmplifyConfig();
  console.log('Usando configurações do ambiente');
}

// Garantir que as configurações estão corretas
if (!config.aws_user_pools_id || !config.aws_user_pools_web_client_id) {
  console.error('Configurações do Cognito ausentes ou inválidas!');
  console.log('Configurações:', JSON.stringify(config, null, 2));
}

console.log('Configurando Amplify com:', {
  region: config.aws_project_region,
  userPoolId: config.aws_user_pools_id,
  userPoolWebClientId: config.aws_user_pools_web_client_id,
  authenticationFlowType: 'USER_PASSWORD_AUTH'
});

Amplify.configure({
  ...config,
  Auth: {
    region: config.aws_project_region,
    userPoolId: config.aws_user_pools_id,
    userPoolWebClientId: config.aws_user_pools_web_client_id,
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
});

export default Amplify;