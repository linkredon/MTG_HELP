# Configuração de Administrador para MTG Helper

Este documento explica como configurar um usuário administrador para o MTG Helper.

## Criando um Usuário Administrador

### Método 1: Usando o Script

1. Certifique-se de que suas credenciais AWS estão configuradas corretamente no ambiente:
   ```
   export AWS_ACCESS_KEY_ID=sua_access_key_id
   export AWS_SECRET_ACCESS_KEY=sua_secret_access_key
   export AWS_REGION=us-east-2
   ```

2. Execute o script de criação de administrador:
   ```
   node scripts/create-admin.js
   ```

3. O script criará um usuário administrador com as seguintes credenciais:
   - Email: admin@mtghelper.com
   - Senha: Admin@123

4. Você pode modificar o script para personalizar o nome, email e senha do administrador.

### Método 2: Usando o AWS Console

1. Acesse o [AWS Console](https://console.aws.amazon.com/)
2. Navegue até o serviço DynamoDB
3. Selecione a tabela `mtg_users` (ou o nome configurado em suas variáveis de ambiente)
4. Clique em "Criar item"
5. Adicione os seguintes campos:
   - id: (string) - gere um UUID v4
   - name: (string) - "Administrador"
   - email: (string) - seu email de administrador
   - password: (string) - uma senha com hash bcrypt (você pode gerar usando ferramentas online)
   - role: (string) - "admin"
   - joinedAt: (string) - timestamp ISO (ex: "2023-07-09T12:00:00.000Z")
   - createdAt: (string) - mesmo timestamp
   - updatedAt: (string) - mesmo timestamp
   - collectionsCount: (number) - 0
   - totalCards: (number) - 0
   - achievements: (list) - ["admin"]

## Criando Usuários Regulares

Após configurar o administrador, você pode criar usuários regulares de duas maneiras:

1. **Através da interface de registro**: Acesse a página de login e clique em "Registrar".

2. **Através do AWS Console**: Siga o mesmo processo do Método 2 acima, mas defina o campo `role` como "user".

## Solução de Problemas

Se você encontrar problemas ao registrar usuários:

1. Verifique se as tabelas DynamoDB foram criadas corretamente
2. Confirme que as permissões IAM estão configuradas para permitir operações nas tabelas
3. Verifique os logs do AWS CloudWatch para identificar erros específicos
4. Certifique-se de que as variáveis de ambiente estão configuradas corretamente no Amplify