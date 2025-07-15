# Plano de Migração: NextAuth.js para AWS Cognito

Este plano detalha os passos para migrar do uso conjunto de NextAuth.js e AWS Cognito para usar exclusivamente AWS Cognito com autenticação Google.

## 1. Backup (Concluído)

- ✅ Backup de todos os arquivos relevantes de autenticação
- ✅ Scripts de restauração criados (PowerShell e Bash)
- ✅ README com instruções de restauração

## 2. Correções de Configuração (Concluído)

- ✅ Corrigido formato de domínio em `amplifyClient.ts`
- ✅ Corrigido formato de domínio em variáveis de ambiente do `.env.local`
- ✅ Verificado fallback para valores conhecidos

## 3. Remoção do NextAuth.js

### Arquivos para remover:
- [ ] `app/api/auth/[...nextauth]` (diretório completo)
- [ ] `auth.ts` (na raiz do projeto)
- [ ] `lib/auth-config.ts`
- [ ] `lib/authOptions.ts` (se existir)
- [ ] `middleware-auth-fix.ts`
- [ ] Tipos específicos para NextAuth em `types/next-auth.d.ts`

### Dependências para remover:
```bash
npm uninstall next-auth
```

## 4. Atualização das APIs de Autenticação

- [ ] Remover importações e referências a NextAuth em arquivos de componentes
- [ ] Atualizar componentes de Login/Logout para usar apenas Amplify
- [ ] Atualizar middleware de autenticação para verificar apenas sessões do Cognito
- [ ] Verificar e atualizar quaisquer APIs personalizadas que usem NextAuth

## 5. Atualização de Redirecionamentos

- [ ] Atualizar URLs de redirecionamento no AWS Cognito para não incluir rotas do NextAuth
- [ ] Verificar que todos redirecionamentos do Google OAuth estão corretos no Console AWS

## 6. Atualização de Variáveis de Ambiente

- [ ] Remover variáveis específicas do NextAuth (NEXTAUTH_URL, NEXTAUTH_SECRET)
- [ ] Manter apenas variáveis necessárias para Cognito/Amplify

## 7. Testes

- [ ] Testar login com Google
- [ ] Testar manutenção de sessão após refresh
- [ ] Testar logout
- [ ] Testar verificação de autenticação em rotas protegidas

## 8. Implantação

- [ ] Implantar alterações no ambiente de desenvolvimento
- [ ] Implantar alterações no ambiente de produção
- [ ] Monitorar logs para quaisquer erros relacionados à autenticação

## Notas Adicionais

1. **Simplicidade**: Esta migração reduz significativamente a complexidade da autenticação, usando apenas AWS Cognito.

2. **Compatibilidade**: AWS Cognito com Google OAuth fornece todas as funcionalidades necessárias para autenticação.

3. **Manutenção**: Menos código para manter e depurar.

4. **Rollback**: Se necessário, use os scripts de restauração no diretório `backup-auth` para reverter as alterações.

5. **Documentação**: Lembre-se de atualizar qualquer documentação interna sobre o fluxo de autenticação.
