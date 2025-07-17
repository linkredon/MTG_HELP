// Script para verificar e corrigir permissões IAM do DynamoDB

export interface IamPermissionCheck {
  roleName: string;
  policyName: string;
  tables: string[];
  actions: string[];
  status: 'ok' | 'missing' | 'error';
  error?: string;
}

export const REQUIRED_DYNAMODB_PERMISSIONS = {
  roleName: 'amplify-mtghelp-main-e1d7b-authRole',
  policyName: 'DynamoDB-MTG-Collections-Decks-Policy',
  tables: [
    'mtg_collections',
    'mtg_decks'
  ],
  actions: [
    'dynamodb:Query',
    'dynamodb:GetItem',
    'dynamodb:PutItem',
    'dynamodb:UpdateItem',
    'dynamodb:DeleteItem'
  ],
  resources: [
    'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections',
    'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections/index/*',
    'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks',
    'arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks/index/*'
  ]
};

export function generateIamPolicy() {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: REQUIRED_DYNAMODB_PERMISSIONS.actions,
        Resource: REQUIRED_DYNAMODB_PERMISSIONS.resources
      }
    ]
  };
}

export function checkIamPermissions(): IamPermissionCheck {
  const check: IamPermissionCheck = {
    roleName: REQUIRED_DYNAMODB_PERMISSIONS.roleName,
    policyName: REQUIRED_DYNAMODB_PERMISSIONS.policyName,
    tables: REQUIRED_DYNAMODB_PERMISSIONS.tables,
    actions: REQUIRED_DYNAMODB_PERMISSIONS.actions,
    status: 'ok'
  };

  try {
    // Verificar se estamos no ambiente correto
    if (typeof window === 'undefined') {
      check.status = 'error';
      check.error = 'Script deve ser executado no lado do cliente';
      return check;
    }

    // Verificar se o Amplify está configurado
    if (!window.__amplifyConfigured) {
      check.status = 'error';
      check.error = 'Amplify não está configurado';
      return check;
    }

    console.log('🔍 Verificando permissões IAM para DynamoDB...');
    console.log('Role:', check.roleName);
    console.log('Policy:', check.policyName);
    console.log('Tabelas:', check.tables);
    console.log('Ações:', check.actions);

    return check;
  } catch (error) {
    check.status = 'error';
    check.error = error instanceof Error ? error.message : 'Erro desconhecido';
    return check;
  }
}

export function getIamPolicyInstructions(): string {
  return `
## Instruções para corrigir permissões IAM

### 1. Acesse o Console AWS IAM
- Vá para https://console.aws.amazon.com/iam/
- Navegue para "Funções" (Roles)
- Procure por: ${REQUIRED_DYNAMODB_PERMISSIONS.roleName}

### 2. Verifique se a política está anexada
- Clique na role
- Na aba "Permissões", verifique se ${REQUIRED_DYNAMODB_PERMISSIONS.policyName} está listada
- Se não estiver, clique em "Adicionar permissões" > "Anexar políticas"
- Procure e selecione ${REQUIRED_DYNAMODB_PERMISSIONS.policyName}

### 3. Se a política não existir, crie-a:
- Vá para "Políticas" (Policies)
- Clique em "Criar política"
- Use o editor JSON e cole:

${JSON.stringify(generateIamPolicy(), null, 2)}

### 4. Anexe a política à role
- Volte para a role ${REQUIRED_DYNAMODB_PERMISSIONS.roleName}
- Clique em "Adicionar permissões" > "Anexar políticas"
- Selecione a política criada

### 5. Teste as permissões
- Limpe o cache do navegador (Ctrl+Shift+R)
- Faça login novamente
- Verifique se os erros de AccessDeniedException desapareceram
`;
} 