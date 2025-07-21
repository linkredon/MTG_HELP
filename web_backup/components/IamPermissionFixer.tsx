'use client';

import { useState, useEffect } from 'react';

export default function IamPermissionFixer() {
  const [showDetails, setShowDetails] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'error' | 'success'>('checking');

  useEffect(() => {
    // Simular verificação de permissões
    const checkPermissions = async () => {
      try {
        // Aqui você pode adicionar uma verificação real das permissões
        // Por enquanto, vamos simular baseado nos erros que vimos
        setPermissionStatus('error');
      } catch (error) {
        setPermissionStatus('error');
      }
    };

    checkPermissions();
  }, []);

  const getPolicyJson = () => {
    return `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_collections/index/*",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_decks/index/*",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_favorites",
        "arn:aws:dynamodb:us-east-2:548334874057:table/mtg_favorites/index/*"
      ]
    }
  ]
}`;
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Permissões IAM incompletas detectadas
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                O app não consegue acessar todas as tabelas do DynamoDB. 
                A tabela <code className="bg-yellow-100 px-1 rounded">mtg_favorites</code> não está incluída na policy.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="ml-3 flex-shrink-0 text-yellow-800 hover:text-yellow-900"
        >
          {showDetails ? 'Ocultar' : 'Ver detalhes'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4">
          <div className="bg-white border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Como corrigir:</h4>
            
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                Vá no <strong>AWS Console</strong> → <strong>Cognito</strong> → <strong>Identity Pools</strong>
              </li>
              <li>
                Clique no seu Identity Pool: <code className="bg-gray-100 px-1 rounded">mtghelp</code>
              </li>
              <li>
                Vá em <strong>Authentication</strong> e veja o nome do role de "authenticated"
              </li>
              <li>
                Vá no <strong>IAM</strong> → <strong>Roles</strong> e selecione esse role
              </li>
              <li>
                Clique em <strong>Add permissions</strong> → <strong>Create inline policy</strong>
              </li>
              <li>
                Cole o JSON abaixo na policy:
              </li>
            </ol>

            <div className="mt-4">
              <textarea
                readOnly
                value={getPolicyJson()}
                className="w-full h-48 p-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded"
              />
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Depois de salvar a policy, faça logout e login novamente 
                para que o novo token (com as permissões atualizadas) seja usado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 