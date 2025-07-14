# Google OAuth Login - Guia de Implementação

Este guia explica como implementar e configurar o login com Google em sua aplicação MTG Helper.

## Pré-requisitos

1. Uma conta do Google Cloud Platform
2. Acesso ao AWS Cognito para configuração
3. Ambiente de desenvolvimento local funcionando

## Etapas de Configuração

### 1. Configurar o Google Cloud Platform

1. Acesse o [Console do Google Cloud Platform](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, navegue até "APIs e Serviços" > "Credenciais"
4. Clique em "Criar Credenciais" e selecione "ID do cliente OAuth"
5. Configure o tipo de aplicativo como "Aplicativo da Web"
6. Dê um nome ao seu aplicativo (ex: "MTG Helper Auth")
7. Em "URIs de redirecionamento autorizados", adicione:
   - `http://localhost:3000/api/auth/callback/google` (para desenvolvimento)
   - `https://seu-dominio.com/api/auth/callback/google` (para produção)
8. Clique em "Criar" para gerar seu Client ID e Client Secret
9. Anote o Client ID e Client Secret para uso posterior

### 2. Configurar o AWS Cognito

1. Acesse o console da AWS e navegue até o serviço Cognito
2. Selecione seu User Pool existente ou crie um novo
3. Vá para a guia "App integration" (Integração de apps)
4. Na seção "App clients and analytics", selecione seu app client ou crie um novo
5. Em "Hosted UI", habilite o provedor de identidade do Google
6. Adicione o Client ID e Client Secret do Google obtidos anteriormente
7. Configure os escopos desejados (geralmente "profile email openid")
8. Adicione URLs de retorno de chamada:
   - `http://localhost:3000/` (para desenvolvimento)
   - `https://seu-dominio.com/` (para produção)
9. Salve as alterações

### 3. Configurar a Aplicação

1. Acesse a página de administração da aplicação
2. Vá para a seção "Configurar OAuth do Google"
3. Preencha os campos:
   - **Client ID**: O ID do cliente fornecido pelo Google
   - **Client Secret**: O segredo do cliente fornecido pelo Google
   - **URL de Redirecionamento**: A URL de redirecionamento após a autenticação
4. Salve as configurações
5. Reinicie o servidor para aplicar as alterações

### 4. Testar o Login

1. Acesse a página de login da aplicação
2. Clique no botão "Entrar com Google"
3. Você será redirecionado para a página de autenticação do Google
4. Após autenticar, você será redirecionado de volta para a aplicação
5. Verifique se o login foi bem-sucedido e se as informações do usuário estão corretas

## Solução de Problemas

### Erro de Redirecionamento

- Verifique se as URLs de redirecionamento estão configuradas corretamente no Google Cloud Platform
- Verifique se as URLs de callback estão configuradas corretamente no AWS Cognito

### Erro de Autenticação

- Verifique se o Client ID e Client Secret estão corretos
- Verifique se o provedor Google está habilitado no Cognito
- Confirme que os escopos necessários estão configurados

### Erro após o Redirecionamento

- Verifique os logs do servidor para obter detalhes sobre o erro
- Confirme que o middleware de autenticação está configurado corretamente

## Recursos Adicionais

- [Documentação do Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentação do AWS Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html)
- [Documentação do NextAuth.js](https://next-auth.js.org/providers/google)
