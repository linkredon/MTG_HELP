"use client";
import { Amplify } from 'aws-amplify';

/**
 * Esta função imprime todas as informações de configuração de autenticação
 * que são relevantes para depurar problemas de login com Google.
 */
export function printAuthDiagnostic() {
  try {
    console.group('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
    
    // Obter configuração atual do Amplify
    const config = Amplify.getConfig();
    
    // Informações do Cognito
    const authConfig = config.Auth?.Cognito;
    console.log('🔐 COGNITO CONFIG:');
    console.log('  User Pool ID:', authConfig?.userPoolId || 'Não encontrado');
    console.log('  App Client ID:', authConfig?.userPoolClientId || 'Não encontrado');
    
    // Informações de OAuth
    const oauthConfig = authConfig?.loginWith?.oauth;
    if (oauthConfig) {
      console.log('🔑 OAUTH CONFIG:');
      console.log('  Domain:', oauthConfig.domain || 'Não encontrado');
      console.log('  Scopes:', oauthConfig.scopes?.join(', ') || 'Não encontrado');
      console.log('  Response Type:', oauthConfig.responseType || 'Não encontrado');
      console.log('  Providers:', oauthConfig.providers?.join(', ') || 'Não encontrado');
      
      // URLs de redirecionamento
      console.log('  Redirect Sign In URLs:');
      if (Array.isArray(oauthConfig.redirectSignIn)) {
        oauthConfig.redirectSignIn.forEach((url: string, index: number) => {
          console.log(`    ${index + 1}. ${url}`);
          
          // Verificar se a URL tem formato válido
          try {
            new URL(url);
          } catch (e) {
            console.error(`    ❌ URL inválida: ${url}`);
          }
        });
      } else {
        console.log('    Nenhuma URL encontrada');
      }
      
      console.log('  Redirect Sign Out URLs:');
      if (Array.isArray(oauthConfig.redirectSignOut)) {
        oauthConfig.redirectSignOut.forEach((url: string, index: number) => {
          console.log(`    ${index + 1}. ${url}`);
        });
      } else {
        console.log('    Nenhuma URL encontrada');
      }

      // Verificar problemas comuns com o domínio
      if (oauthConfig.domain) {
        const domain = oauthConfig.domain;
        console.log('🔍 VALIDAÇÃO DE DOMÍNIO:');
        
        if (!domain.startsWith('https://')) {
          console.error('  ❌ O domínio não começa com https://. Isso pode causar problemas de redirecionamento!');
          console.log('  Domínio atual:', domain);
          console.log('  Domínio correto deveria ser:', `https://${domain.replace('https://', '')}`);
        } else {
          console.log('  ✅ Domínio tem prefixo https:// correto');
        }
        
        if (domain.endsWith('/')) {
          console.error('  ❌ O domínio termina com barra (/). Isso pode causar problemas de URL dupla!');
          console.log('  Domínio atual:', domain);
          console.log('  Domínio correto deveria ser:', domain.slice(0, -1));
        } else {
          console.log('  ✅ Domínio não termina com barra (formato correto)');
        }
        
        if (!domain.includes('.auth.')) {
          console.warn('  ⚠️ O domínio não parece ser um domínio Cognito padrão (não contém .auth.)');
        }
      }
    } else {
      console.log('❌ Configuração OAuth não encontrada!');
    }
    
    // Informações do ambiente
    console.log('🌐 AMBIENTE:');
    console.log('  Hostname:', window.location.hostname);
    console.log('  Origin:', window.location.origin);
    console.log('  URL Completa:', window.location.href);
    console.log('  Porta:', window.location.port || '80/443');
    console.log('  Demo Mode:', localStorage.getItem('NEXT_PUBLIC_DEMO_MODE') || 'false');
    console.log('  User Agent:', navigator.userAgent);
    
    // Verificar se as URLs de redirecionamento incluem a origem atual
    if (oauthConfig?.redirectSignIn) {
      const currentOrigin = window.location.origin;
      const includesCurrentOrigin = Array.isArray(oauthConfig.redirectSignIn) && 
        oauthConfig.redirectSignIn.some((url: string) => url.includes(currentOrigin));
      
      console.log('🔍 VERIFICAÇÃO DE ORIGEM:');
      if (includesCurrentOrigin) {
        console.log('  ✅ A origem atual está incluída nas URLs de redirecionamento');
      } else {
        console.log('  ❌ A origem atual NÃO está incluída nas URLs de redirecionamento!');
        console.log('  Origem atual:', currentOrigin);
        console.log('  Este problema pode causar falhas no login OAuth.');
      }
    }

    // Verificar cookies de autenticação existentes
    console.log('🍪 COOKIES:');
    const cookies = document.cookie.split(';');
    if (cookies.length > 0) {
      let authCookiesFound = false;
      cookies.forEach(cookie => {
        const trimmedCookie = cookie.trim();
        if (
          trimmedCookie.startsWith('amplify-signin-with-') ||
          trimmedCookie.startsWith('next-auth') ||
          trimmedCookie.startsWith('__Host-next-auth') ||
          trimmedCookie.startsWith('CognitoIdentityServiceProvider')
        ) {
          console.log(`  📌 Cookie de autenticação encontrado: ${trimmedCookie.split('=')[0]}`);
          authCookiesFound = true;
        }
      });
      
      if (!authCookiesFound) {
        console.log('  ⚠️ Nenhum cookie de autenticação encontrado');
      }
    } else {
      console.log('  Nenhum cookie encontrado');
    }

    // Verificar se há bloqueadores de cookies ou pop-ups
    console.log('🔒 VERIFICAÇÃO DE PRIVACIDADE:');
    let cookieTestValue = 'auth_diagnostic_test';
    try {
      document.cookie = `auth_test=${cookieTestValue}; path=/; max-age=60`;
      if (document.cookie.includes('auth_test')) {
        console.log('  ✅ Cookies estão habilitados');
        // Limpar cookie de teste
        document.cookie = 'auth_test=; path=/; max-age=0';
      } else {
        console.error('  ❌ Cookies estão bloqueados! Isso impedirá o login.');
      }
    } catch (cookieErr) {
      console.error('  ❌ Erro ao testar cookies:', cookieErr);
    }

    // Verificar localStorage (usado pelo Amplify)
    console.log('📦 ARMAZENAMENTO LOCAL:');
    try {
      const testKey = 'auth_diagnostic_test';
      localStorage.setItem(testKey, 'test');
      if (localStorage.getItem(testKey) === 'test') {
        console.log('  ✅ localStorage está funcionando');
        localStorage.removeItem(testKey);
      } else {
        console.error('  ❌ localStorage não está funcionando corretamente!');
      }
      
      // Verificar se há itens relacionados ao Amplify
      const amplifyKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('amplify') || key.includes('CognitoIdentity') || key.includes('token'))) {
          amplifyKeys.push(key);
        }
      }
      
      if (amplifyKeys.length > 0) {
        console.log(`  📌 Encontrados ${amplifyKeys.length} itens relacionados ao Amplify no localStorage`);
      } else {
        console.log('  ℹ️ Nenhum item relacionado ao Amplify encontrado no localStorage');
      }
    } catch (storageErr) {
      console.error('  ❌ Erro ao testar localStorage:', storageErr);
    }
    
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar diagnóstico de autenticação:', error);
    return false;
  }
}

/**
 * Verifica se a autenticação pode ser bem-sucedida com base na configuração atual
 * @returns Um objeto com o resultado da verificação e possíveis problemas
 */
export function validateAuthConfiguration() {
  try {
    const config = Amplify.getConfig();
    const authConfig = config.Auth?.Cognito;
    const oauthConfig = authConfig?.loginWith?.oauth;
    const currentOrigin = window.location.origin;
    
    const issues = [];
    const warnings = [];
    
    // Verificações críticas
    if (!authConfig?.userPoolId) {
      issues.push('Não foi encontrado um User Pool ID');
    }
    
    if (!authConfig?.userPoolClientId) {
      issues.push('Não foi encontrado um App Client ID');
    }
    
    if (!oauthConfig?.domain) {
      issues.push('Não foi encontrado um domínio OAuth');
    } else {
      if (!oauthConfig.domain.startsWith('https://')) {
        issues.push('O domínio OAuth não usa HTTPS');
      }
      
      if (oauthConfig.domain.endsWith('/')) {
        warnings.push('O domínio OAuth termina com uma barra (/)');
      }
    }
    
    // Verificar URLs de redirecionamento
    if (!Array.isArray(oauthConfig?.redirectSignIn) || oauthConfig.redirectSignIn.length === 0) {
      issues.push('Não foram encontradas URLs de redirecionamento');
    } else {
      const includesCurrentOrigin = oauthConfig.redirectSignIn.some(url => url.includes(currentOrigin));
      if (!includesCurrentOrigin) {
        issues.push(`A origem atual (${currentOrigin}) não está nas URLs de redirecionamento`);
      }
      
      // Verificar formato das URLs
      oauthConfig.redirectSignIn.forEach(url => {
        try {
          new URL(url);
        } catch (e) {
          issues.push(`URL de redirecionamento inválida: ${url}`);
        }
      });
    }
    
    // Verificar provedores
    if (!Array.isArray(oauthConfig?.providers) || !oauthConfig.providers.includes('Google')) {
      warnings.push('Google não está listado como provedor OAuth');
    }
    
    return {
      isValid: issues.length === 0,
      canProceed: issues.length === 0,
      issues,
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      canProceed: false,
      issues: [`Erro ao validar configuração: ${error instanceof Error ? error.message : String(error)}`],
      warnings: []
    };
  }
}

/**
 * Retorna um objeto com todos os dados de diagnóstico
 * útil para exibir em um componente de UI
 */
export function getAuthDiagnosticData() {
  try {
    const config = Amplify.getConfig();
    const authConfig = config.Auth?.Cognito;
    const oauthConfig = authConfig?.loginWith?.oauth;
    
    // Executar validação
    const validationResult = validateAuthConfiguration();
    
    return {
      userPoolId: authConfig?.userPoolId || 'Não encontrado',
      clientId: authConfig?.userPoolClientId || 'Não encontrado',
      domain: oauthConfig?.domain || 'Não encontrado',
      providers: oauthConfig?.providers || [],
      redirectSignIn: oauthConfig?.redirectSignIn || [],
      redirectSignOut: oauthConfig?.redirectSignOut || [],
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
      hasMatchingRedirect: typeof window !== 'undefined' && Array.isArray(oauthConfig?.redirectSignIn)
        ? oauthConfig.redirectSignIn.some(url => url.includes(window.location.origin))
        : false,
      validation: validationResult,
      domainHasHttps: oauthConfig?.domain?.startsWith('https://') || false,
      cookiesEnabled: typeof document !== 'undefined' ? navigator.cookieEnabled : false
    };
  } catch (error) {
    console.error('Erro ao obter dados de diagnóstico:', error);
    return {
      error: 'Falha ao obter dados de configuração',
      errorDetails: error instanceof Error ? error.message : String(error)
    };
  }
}

export default { printAuthDiagnostic, getAuthDiagnosticData, validateAuthConfiguration };
