# Guia de Configuração OAuth - AWS Cognito

## Problema
O erro `redirect_mismatch` ocorre porque a URL `http://localhost:3000/` não está na lista de URLs permitidas no Cognito.

## Solução Manual

### 1. Acesse o Console AWS
- URL: https://console.aws.amazon.com/
- Faça login com suas credenciais

### 2. Navegue para o Cognito
- Vá para "Cognito" no menu de serviços
- Clique em "User pools"
- Selecione o User Pool: `us-east-2_GIWZQN4d2`

### 3. Configure o App Client
- Vá para a aba "App integration"
- Na seção "App clients and analytics", clique no app client: `55j5l3rcp164av86djhf9qpjch`
- Clique em "Edit"

### 4. Adicione as URLs de redirecionamento

**Callback URLs (URLs de retorno):**
```
https://main.da2h2t88kn6qm.amplifyapp.com/
http://localhost:3000/
http://localhost:3001/
http://localhost:3002/
http://localhost:3003/
http://localhost:3004/
http://localhost:3005/
https://mtghelper.com/
https://www.mtghelper.com/
```

**Sign out URLs (URLs de logout):**
```
https://main.da2h2t88kn6qm.amplifyapp.com/
http://localhost:3000/
http://localhost:3001/
http://localhost:3002/
http://localhost:3003/
http://localhost:3004/
http://localhost:3005/
https://mtghelper.com/
https://www.mtghelper.com/
```

### 5. Verifique as configurações OAuth
- Em "OAuth 2.0", certifique-se de que:
  - ✅ "Authorization code grant" está habilitado
  - ❌ "Implicit grant" está desabilitado
  - ✅ "Google" está listado em "Identity providers"

### 6. Salve as alterações
- Clique em "Save changes"

## Teste
Após salvar, teste o login com Google novamente. O erro `redirect_mismatch` deve ser resolvido.

## URLs Importantes
- **User Pool ID:** `us-east-2_GIWZQN4d2`
- **App Client ID:** `55j5l3rcp164av86djhf9qpjch`
- **Cognito Domain:** `mtghelper.auth.us-east-2.amazoncognito.com`
- **Identity Pool ID:** `us-east-2:8681c7d7-6e0e-494f-9f0a-fe9f8d949db5` 