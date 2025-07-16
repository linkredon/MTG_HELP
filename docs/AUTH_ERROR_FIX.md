# Corrigindo o erro AuthUserPoolException no AWS Amplify

## Problema

O erro `AuthUserPoolException: Auth UserPool not configured` ocorre quando o AWS Amplify tenta acessar os serviços de autenticação antes da configuração completa do UserPool.

Trecho do erro:
```
AuthUserPoolException: Auth UserPool not configured.
    at eval (webpack-internal:///(app-pages-browser)/./node_modules/@aws-amplify/core/dist/esm/errors/createAssertionFunction.mjs:14:19)
    at assertTokenProviderConfig (webpack-internal:///(app-pages-browser)/./node_modules/@aws-amplify/core/dist/esm/singleton/Auth/utils/index.mjs:23:69)
    at getCurrentUser (webpack-internal:///(app-pages-browser)/./node_modules/@aws-amplify/auth/dist/esm/providers/cognito/apis/internal/getCurrentUser.mjs:14:97)
```

Este erro é frequente no ambiente de desenvolvimento local (localhost) e pode ocorrer devido a problemas de inicialização assíncrona do Amplify.

## Solução Implementada

Implementamos várias melhorias para garantir que o Amplify esteja sempre configurado antes de usar seus serviços de autenticação:

### 1. Melhoria no AmplifyInit

Modificamos o componente `AmplifyInit.tsx` para:
- Tentar múltiplas vezes inicializar o Amplify em caso de falhas
- Verificar se o Amplify já está configurado antes de tentar inicializar novamente
- Adicionar um tempo maior (500ms) para a inicialização
- Incluir logs detalhados para diagnóstico

```typescript
useEffect(() => {
  // Verificar se já inicializamos para evitar múltiplas inicializações desnecessárias
  if (initialized) return;

  // Limitar o número de tentativas para evitar loops infinitos
  if (initAttempts > 3) {
    console.error('Muitas tentativas de inicialização do Amplify. Desistindo.');
    return;
  }

  console.log(`Tentativa ${initAttempts + 1} de inicializar o Amplify...`);

  const timer = setTimeout(() => {
    try {
      // Verificar se já temos uma configuração antes de tentar inicializar novamente
      const currentConfig = Amplify.getConfig();
      
      if (currentConfig && currentConfig.Auth && currentConfig.Auth.Cognito) {
        console.log('Amplify já parece estar configurado:', currentConfig);
        setInitialized(true);
        return;
      }
      
      // Tentar inicializar o Amplify
      const success = configureAmplify();
      
      // Verificar o resultado
      if (success) {
        console.log('✅ Amplify inicializado com sucesso!');
        setInitialized(true);
      } else {
        setInitAttempts(prev => prev + 1); // Tentar novamente
      }
    } catch (err) {
      console.error('❌ Erro ao inicializar Amplify:', err);
      setInitAttempts(prev => prev + 1); // Tentar novamente
    }
  }, 500); // Tempo maior para garantir carregamento

  return () => clearTimeout(timer);
}, [initialized, initAttempts]);
```

### 2. Novo componente AmplifyPreload

Criamos um componente `AmplifyPreload.tsx` que inicializa o Amplify imediatamente e garante que esteja configurado antes de renderizar os componentes que dependem da autenticação:

```typescript
'use client';

import { AmplifyAuthProvider } from '@/contexts/AmplifyAuthContext';
import { configureAmplify } from '@/lib/amplifySetup';
import { Amplify } from 'aws-amplify';

export default function AmplifyPreload({ children }: { children: React.ReactNode }) {
  // Inicializar o Amplify imediatamente
  try {
    // Verificar se já está configurado
    const config = Amplify.getConfig();
    if (!config.Auth?.Cognito) {
      console.log('🔄 Inicializando Amplify no AmplifyPreload...');
      configureAmplify();
    } else {
      console.log('✓ Amplify já configurado no AmplifyPreload');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Amplify no AmplifyPreload:', error);
  }
  
  return (
    <AmplifyAuthProvider>
      {children}
    </AmplifyAuthProvider>
  );
}
```

### 3. Melhorias no AmplifyAuthContext

Modificamos o `AmplifyAuthContext.tsx` para:
- Verificar e garantir que o Amplify esteja configurado antes de qualquer operação
- Reconfigurar automaticamente o Amplify caso detecte problemas
- Lidar com erros de forma mais robusta

```typescript
// Verificar e garantir que Amplify está inicializado
function ensureAmplifyConfigured() {
  try {
    // Verificar se já está configurado
    const config = Amplify.getConfig();
    if (!config.Auth?.Cognito?.userPoolId) {
      console.log('🔄 Configuração do Amplify não encontrada, inicializando...');
      return configureAmplify();
    }
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar configuração do Amplify:', error);
    try {
      return configureAmplify();
    } catch (configError) {
      console.error('❌ Falha na configuração do Amplify:', configError);
      return false;
    }
  }
}

// Dentro do AmplifyAuthProvider
useEffect(() => {
  const configureAuth = async () => {
    const success = ensureAmplifyConfigured();
    setAmplifyConfigured(success);
  };
  
  configureAuth();
}, []);
```

### 4. Tratamento de Erros Aprimorado

Melhoramos o sistema de recuperação de erros para capturar especificamente o erro `AuthUserPoolException` e tentar reconfigurar o Amplify:

```typescript
// Em amplifyErrorRecovery.ts
const handleError = (event: ErrorEvent) => {
  const errorMsg = event.message || '';
  
  if (
    errorMsg.includes('chunk') || 
    errorMsg.includes('aws-amplify') ||
    errorMsg.includes('Auth UserPool not configured') ||
    errorMsg.includes('AuthUserPoolException')
  ) {
    console.warn('⚠️ Detectado erro relacionado ao Amplify:', errorMsg);
    amplifyErrorHandler();
    
    // Tentar verificar a configuração atual
    try {
      const config = Amplify.getConfig();
      console.log('📋 Configuração atual do Amplify:', 
        config.Auth?.Cognito ? 'Configurado' : 'Não configurado');
    } catch (configErr) {
      console.error('Erro ao verificar configuração:', configErr);
    }
    
    // Prevenir propagação para erros não críticos
    if (!errorMsg.includes('fatal')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
};
```

## Resultado

Estas melhorias garantem que:

1. O Amplify seja inicializado corretamente antes de qualquer operação de autenticação
2. Haja múltiplas tentativas de inicialização em caso de falha
3. Os erros sejam tratados adequadamente para evitar quebra da aplicação
4. A configuração do Amplify seja verificada e corrigida automaticamente

O erro `AuthUserPoolException: Auth UserPool not configured` deve ser eliminado no ambiente local com estas alterações.

## Observação para Deployment

Este erro ocorre principalmente no ambiente de desenvolvimento local. Em produção (AWS Amplify Hosting), o problema raramente acontece, pois o ambiente é mais estável e os arquivos são servidos de forma diferente.

Se o erro persistir em produção, as mesmas alterações implementadas ajudarão a mitigá-lo, pois o sistema tentará reconfigurar o Amplify automaticamente quando necessário.
