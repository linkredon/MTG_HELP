import { NextResponse } from 'next/server';

/**
 * API para verificar e corrigir configurações do Cognito
 */
export async function GET() {
  try {
    // Coletar informações de configuração relevantes
    const configInfo = {
      domainConfig: {
        NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'Não configurado',
        NEXT_PUBLIC_HOSTED_UI_DOMAIN: process.env.NEXT_PUBLIC_HOSTED_UI_DOMAIN || 'Não configurado',
        OAUTH_DOMAIN: process.env.OAUTH_DOMAIN || 'Não configurado',
      },
      userPoolConfig: {
        NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || 'Não configurado',
        NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || 'Não configurado',
        NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION || 'Não configurado',
      },
      redirectConfig: {
        OAUTH_REDIRECT_SIGNIN: process.env.OAUTH_REDIRECT_SIGNIN || 'Não configurado',
        OAUTH_REDIRECT_SIGNOUT: process.env.OAUTH_REDIRECT_SIGNOUT || 'Não configurado',
        OAUTH_REDIRECT_SIGNIN_PRODUCTION: process.env.OAUTH_REDIRECT_SIGNIN_PRODUCTION || 'Não configurado',
        OAUTH_REDIRECT_SIGNOUT_PRODUCTION: process.env.OAUTH_REDIRECT_SIGNOUT_PRODUCTION || 'Não configurado',
      },
      loginPageUrl: generateLoginPageUrl(),
      oauthUrl: generateOAuthUrl(),
    };

    // Verificar se existem problemas conhecidos
    const issues = detectIssues(configInfo);
    
    return NextResponse.json({ 
      status: 'success', 
      configInfo,
      issues,
      possibleSolutions: generateSolutions(issues),
    });
  } catch (error) {
    console.error('Erro ao processar API de verificação Cognito:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 });
  }
}

/**
 * Gera URL da página de login do Cognito
 */
function generateLoginPageUrl() {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'mtghelper.auth.us-east-2.amazoncognito.com';
  const domainWithProtocol = domain.startsWith('https://') ? domain : `https://${domain}`;
  const clientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || '55j5l3rcp164av86djhf9qpjch';
  
  return `${domainWithProtocol}/login?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:3000`;
}

/**
 * Gera URL OAuth para o provedor Google
 */
function generateOAuthUrl() {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'mtghelper.auth.us-east-2.amazoncognito.com';
  const domainWithProtocol = domain.startsWith('https://') ? domain : `https://${domain}`;
  const clientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || '55j5l3rcp164av86djhf9qpjch';
  
  return `${domainWithProtocol}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:3000&identity_provider=Google`;
}

/**
 * Definição de tipos para a configuração e problemas
 */
interface ConfigInfo {
  domainConfig: {
    NEXT_PUBLIC_COGNITO_DOMAIN: string;
    NEXT_PUBLIC_HOSTED_UI_DOMAIN: string;
    OAUTH_DOMAIN: string;
    [key: string]: string | undefined;
  };
  userPoolConfig: {
    NEXT_PUBLIC_USER_POOL_ID: string;
    NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: string;
    NEXT_PUBLIC_REGION: string;
  };
  redirectConfig: {
    OAUTH_REDIRECT_SIGNIN: string;
    OAUTH_REDIRECT_SIGNOUT: string;
    OAUTH_REDIRECT_SIGNIN_PRODUCTION?: string;
    OAUTH_REDIRECT_SIGNOUT_PRODUCTION?: string;
  };
  loginPageUrl: string;
  oauthUrl: string;
  amplifyConfig?: any;
  redirectUrls?: string[];
}

interface Issue {
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'critical' | 'high';
}

/**
 * Detecta possíveis problemas na configuração
 */
function detectIssues(configInfo: ConfigInfo): Issue[] {
  const issues: Issue[] = [];
  
  // Verificar domínios
  const cognitoDomain = configInfo.domainConfig.NEXT_PUBLIC_COGNITO_DOMAIN;
  const hostedUiDomain = configInfo.domainConfig.NEXT_PUBLIC_HOSTED_UI_DOMAIN;
  const oauthDomain = configInfo.domainConfig.OAUTH_DOMAIN;
  
  if (!cognitoDomain || cognitoDomain === 'Não configurado') {
    issues.push({
      type: 'domain_missing',
      severity: 'critical',
      message: 'Domínio do Cognito não está configurado (NEXT_PUBLIC_COGNITO_DOMAIN)',
    });
  }
  
  if (cognitoDomain !== hostedUiDomain) {
    issues.push({
      type: 'domain_mismatch',
      severity: 'high',
      message: 'Discrepância entre NEXT_PUBLIC_COGNITO_DOMAIN e NEXT_PUBLIC_HOSTED_UI_DOMAIN',
    });
  }
  
  // Verificar se os domínios começam com https://
  const domains = [cognitoDomain, hostedUiDomain, oauthDomain].filter((domain): domain is string => Boolean(domain) && domain !== 'Não configurado');
  domains.forEach(domain => {
    if (!domain.startsWith('https://')) {
      issues.push({
        type: 'domain_no_https',
        severity: 'high',
        message: `Domínio não começa com https://: ${domain}`,
      });
    }
  });
  
  // Verificar URLs de redirecionamento
  const signinUrl = configInfo.redirectConfig.OAUTH_REDIRECT_SIGNIN;
  if (!signinUrl.includes('localhost') && !signinUrl.includes('main.da2h2t88kn6qm.amplifyapp.com')) {
    issues.push({
      type: 'invalid_redirect',
      severity: 'critical',
      message: 'URLs de redirecionamento não incluem localhost ou domínio da aplicação',
    });
  }
  
  return issues;
}

/**
 * Gera soluções baseadas nos problemas encontrados
 */
function generateSolutions(issues: Issue[]): string[] {
  const solutions: string[] = [];
  
  issues.forEach(issue => {
    switch(issue.type) {
      case 'domain_missing':
        solutions.push(
          'Configure NEXT_PUBLIC_COGNITO_DOMAIN com o domínio do Cognito no formato: mtghelper.auth.us-east-2.amazoncognito.com'
        );
        break;
        
      case 'domain_mismatch':
        solutions.push(
          'Garanta que NEXT_PUBLIC_COGNITO_DOMAIN e NEXT_PUBLIC_HOSTED_UI_DOMAIN tenham o mesmo valor'
        );
        break;
        
      case 'domain_no_https':
        solutions.push(
          'Certifique-se que todos os domínios comecem com https://'
        );
        break;
        
      case 'invalid_redirect':
        solutions.push(
          'Verifique se as URLs de redirecionamento no console AWS incluem: http://localhost:3000 e https://main.da2h2t88kn6qm.amplifyapp.com'
        );
        solutions.push(
          'Verifique se OAUTH_REDIRECT_SIGNIN e OAUTH_REDIRECT_SIGNIN_PRODUCTION estão corretos no .env.local'
        );
        break;
    }
  });
  
  // Soluções adicionais genéricas
  solutions.push('Verifique no console AWS se o Hosted UI está habilitado para o User Pool');
  solutions.push('Verifique se o App Client tem permissão para usar o Hosted UI no console AWS');
  solutions.push('Confirme se o provedor de identidade Google está configurado corretamente');
  
  return solutions;
}
