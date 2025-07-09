# Guia de Implantação do MTG Helper

Este guia descreve os passos necessários para implantar o MTG Helper em produção.

## Pré-requisitos

1. **Conta MongoDB Atlas**
   - Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Configure um cluster (o plano gratuito é suficiente para começar)
   - Crie um banco de dados chamado `mtghelper`
   - Crie um usuário com permissões de leitura/escrita

2. **Conta Vercel**
   - Crie uma conta em [Vercel](https://vercel.com)
   - Conecte ao seu repositório GitHub

## Configuração do Ambiente

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Vercel:

```
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.mongodb.net/mtghelper?retryWrites=true&w=majority
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=seu_segredo_nextauth_muito_seguro
JWT_SECRET=seu_segredo_jwt_muito_seguro
JWT_EXPIRE=30d
SCRYFALL_API_DELAY=100
```

### 2. Configuração do MongoDB Atlas

1. Vá para a seção "Network Access" no MongoDB Atlas
2. Adicione o IP `0.0.0.0/0` para permitir acesso de qualquer lugar (ou restrinja conforme necessário)
3. Certifique-se de que o usuário tem as permissões corretas

### 3. Configuração do NextAuth

1. Certifique-se de que o `NEXTAUTH_URL` está configurado corretamente com o domínio da sua aplicação
2. Gere um segredo forte para `NEXTAUTH_SECRET` e `JWT_SECRET`

## Implantação

### 1. Implantação no Vercel

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente mencionadas acima
3. Implante o projeto

### 2. Verificação Pós-Implantação

1. Teste o registro de usuário
2. Teste o login
3. Teste a criação de coleções
4. Teste a adição de cartas
5. Teste a criação de decks
6. Teste a adição de favoritos

## Monitoramento e Manutenção

### 1. Monitoramento

1. Configure alertas no MongoDB Atlas para monitorar o uso do banco de dados
2. Use o painel do Vercel para monitorar o desempenho da aplicação

### 2. Backup

1. Configure backups automáticos no MongoDB Atlas
2. Exporte periodicamente os dados importantes

### 3. Atualizações

1. Mantenha as dependências atualizadas
2. Teste as atualizações em um ambiente de desenvolvimento antes de implantar em produção

## Solução de Problemas

### Problemas de Conexão com o MongoDB

1. Verifique se a string de conexão está correta
2. Verifique se o IP está na lista de permissões
3. Verifique se o usuário tem as permissões corretas

### Problemas de Autenticação

1. Verifique se o `NEXTAUTH_URL` está configurado corretamente
2. Verifique se os segredos estão configurados corretamente
3. Verifique os logs do Vercel para erros específicos

### Problemas com a API do Scryfall

1. Verifique se o `SCRYFALL_API_DELAY` está configurado para evitar rate limiting
2. Implemente um sistema de cache para reduzir o número de chamadas à API

## Recursos Adicionais

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do NextAuth.js](https://next-auth.js.org/getting-started/introduction)
- [Documentação do MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação da API do Scryfall](https://scryfall.com/docs/api)