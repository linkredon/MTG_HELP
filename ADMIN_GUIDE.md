# Guia de Administração do MTG Helper

Este guia explica como configurar e gerenciar usuários administradores no MTG Helper.

## Acessando o Painel de Administração

O painel de administração está disponível em `/admin` e só pode ser acessado por usuários com a função de administrador.

## Definindo um Usuário como Administrador

### Método 1: Usando o AWS Console

1. Acesse o [AWS Console](https://console.aws.amazon.com/)
2. Navegue até o serviço Amazon Cognito
3. Selecione o User Pool criado pelo Amplify (geralmente com um nome como "mtghelp8a3ee920_userpool_8a3ee920-dev")
4. Vá para a guia "Users" (Usuários)
5. Encontre o usuário que deseja tornar administrador
6. Clique no usuário para ver seus detalhes
7. Vá para a seção "User attributes" (Atributos do usuário)
8. Adicione um atributo personalizado:
   - Nome: custom:role
   - Valor: admin

### Método 2: Usando o Script

1. Instale as dependências necessárias:
   ```bash
   npm install @aws-sdk/client-cognito-identity-provider
   ```

2. Execute o script `set-admin.js` fornecendo o email do usuário:
   ```bash
   node scripts/set-admin.js usuario@exemplo.com
   ```

## Criando um Novo Usuário Administrador

1. Registre um novo usuário através da interface de login
2. Confirme o registro (verifique o email ou use o AWS Console para confirmar manualmente)
3. Defina o usuário como administrador usando um dos métodos acima

## Recursos de Administração

Como administrador, você pode:

1. Ver todos os usuários registrados
2. Promover usuários para administradores
3. Excluir usuários
4. Gerenciar coleções e decks

## Solução de Problemas

Se você encontrar problemas ao acessar o painel de administração:

1. Verifique se o usuário tem o atributo `custom:role` definido como `admin`
2. Certifique-se de que o usuário está autenticado
3. Verifique os logs do console para erros específicos

Para verificar se um usuário tem a função de administrador:

1. Acesse o AWS Console > Cognito > User Pools
2. Selecione seu User Pool
3. Encontre o usuário e verifique seus atributos

## Suporte

Se precisar de ajuda adicional, entre em contato com o suporte técnico.