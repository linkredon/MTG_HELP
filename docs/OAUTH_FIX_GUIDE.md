# Diagnóstico e Correção de OAuth no AWS Amplify

Este documento fornece instruções sobre como diagnosticar e resolver problemas de autenticação com OAuth no AWS Amplify.

## Problema Identificado

Ao implantar a aplicação no AWS Amplify, a autenticação OAuth com Google não funciona corretamente. O problema principal está relacionado às URLs de redirecionamento configuradas no Cognito que não correspondem ao URL exato do aplicativo implantado.

## Diagnóstico

O problema pode ser diagnosticado usando o componente `AuthDiagnostic` incluído no projeto, que mostra:

1. A URL atual não está incluída nas URLs de redirecionamento configuradas
2. O domínio Cognito pode não estar usando HTTPS corretamente
3. Pode haver um erro de digitação na URL de redirecionamento (da2ht88kn6qm vs da2h2t88kn6qm)

## Solução

Para resolver os problemas de configuração do OAuth, foi criado um script de correção que:

1. Atualiza as URLs de redirecionamento no arquivo `amplifySetup.ts`
2. Garante que o domínio Cognito use HTTPS corretamente
3. Adiciona logs de diagnóstico para verificar a configuração em tempo de execução

### Executando a correção

```bash
npm run fix-oauth-urls
```

Este comando irá:
- Fazer backup do arquivo original
- Corrigir as URLs de redirecionamento
- Adicionar logs de diagnóstico
- Fornecer instruções sobre o que fazer em seguida

## Passos Manuais Necessários

Após executar o script, você ainda precisa:

1. **Atualizar a configuração do Cognito no AWS Console:**
   - Acesse [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
   - Selecione seu User Pool
   - Vá para "App integration" > "App client settings"
   - Verifique se a URL correta está nas URLs de Callback e Sign out:
     - https://main.da2h2t88kn6qm.amplifyapp.com

2. **Reimplantar o aplicativo no AWS Amplify:**
   - Acesse o console do AWS Amplify
   - Selecione seu aplicativo
   - Vá para Redeploy > Redeploy this version

## Verificando a Correção

Após a implantação, use o componente `AuthDiagnostic` para verificar:

1. A URL atual agora deve estar nas URLs de redirecionamento
2. Não deve haver erros de domínio Cognito
3. O login com Google deve funcionar normalmente

## Informações Adicionais

A configuração correta do OAuth no AWS Amplify requer:

1. URLs de redirecionamento corretas em `amplifySetup.ts`
2. Configuração correspondente no console do AWS Cognito
3. Configuração correspondente no provedor OAuth (Google Console)
4. HTTPS corretamente configurado em todos os endpoints

Se os problemas persistirem após essas correções, verifique os logs do console no navegador para mensagens de erro específicas.
