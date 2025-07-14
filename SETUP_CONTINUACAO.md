# Instruções para Continuação do Projeto

Este documento contém instruções para continuar o desenvolvimento do MTG Helper em outro ambiente.

## 1. Configuração Inicial

### Clone o Repositório
```bash
git clone https://github.com/linkredon/MTG_HELP.git
cd MTG_HELP
```

### Instale as Dependências
```bash
npm install
```

### Configure as Variáveis de Ambiente
1. Crie um arquivo `.env.local` baseado no arquivo `.env.example`
2. Preencha as credenciais necessárias:
   - NextAuth secret (pode ser gerado com `openssl rand -base64 32`)
   - Credenciais do Google OAuth (obtidas no Google Cloud Console)
   - Credenciais da AWS (se estiver usando DynamoDB/Cognito)

## 2. Mudanças Recentes

### Correções de TypeScript
Corrigimos vários problemas de TypeScript relacionados a:
- Propriedade `sub` no tipo User em auth-config.ts
- Interface MobileNavigationProps no componente MobileNavigation
- Configuração das tabs no componente principal

### Otimização de Renderização
- Adicionamos `export const dynamic = 'force-dynamic'` em páginas que precisam de dados dinâmicos
- Utilizamos `export const runtime = 'edge'` para melhorar a compatibilidade de alguns componentes

### Resolução de Problemas de Build
- Criação de um novo arquivo page.tsx limpo
- Correção de duplicação de código nas definições dos tabs
- Adição de Suspense adequado para componentes com hooks

## 3. Execução do Projeto

### Ambiente de Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

## 4. Próximos Passos

### Pontos de Atenção
- O uso do Edge Runtime (`runtime = 'edge'`) desativa a geração estática de páginas
- Considere uma abordagem híbrida para melhorar o desempenho se necessário
- Revise as configurações de NextAuth e AWS Amplify conforme necessário

### Potenciais Melhorias
- Refatorar componentes para melhor separação entre cliente/servidor
- Otimizar carregamento de dados e renderização
- Implementar lazy loading para componentes pesados
