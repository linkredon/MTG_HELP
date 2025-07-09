"use client";

import { useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { listUsers } from '../../src/graphql/queries';
import { createUser, updateUser, deleteUser } from '../../src/graphql/mutations';
import { User as AmplifyUser, CreateUserInput, UpdateUserInput, DeleteUserInput } from '../../lib/API';

export default function AdminPage() {
  // Usando o tipo do Amplify com algumas simplificações
  type AppUser = Pick<AmplifyUser, 'id' | 'name' | 'email' | 'role'>;

  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<{username?: string, userId?: string} | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cliente API para GraphQL
  const client = generateClient();

  // Verificar se o usuário atual é um administrador
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userInfo = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Extrair grupos do token de acesso
        const cognitoGroups = session.tokens?.accessToken?.payload['cognito:groups'];
        const groups = Array.isArray(cognitoGroups) ? cognitoGroups : [];
        
        // Verificar se o usuário é admin
        const customRole = session.tokens?.idToken?.payload['custom:role'];
        const isUserAdmin = groups.includes('Admin') || customRole === 'admin';
        
        setCurrentUser({ 
          username: userInfo.username,
          userId: userInfo.userId 
        });
        setIsAdmin(isUserAdmin);
        
        if (isUserAdmin) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        setError('Você precisa estar logado como administrador para acessar esta página.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, []);

  // Buscar todos os usuários
  const fetchUsers = async () => {
    try {
      const result = await client.graphql({
        query: listUsers
      });
      // Converter os resultados para o tipo AppUser
      const userItems = result.data.listUsers.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role
      }));
      setUsers(userItems);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar usuários.');
    }
  };

  // Criar um novo usuário
  const handleCreateUser = async (userData: Partial<AppUser>) => {
    try {
      // Garantir que os campos obrigatórios estão presentes
      if (!userData.name || !userData.email) {
        setError('Nome e email são obrigatórios');
        return;
      }
      
      const input: CreateUserInput = {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user'
      };
      
      await client.graphql({
        query: createUser,
        variables: { input }
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError('Erro ao criar usuário.');
    }
  };

  // Atualizar um usuário existente
  const handleUpdateUser = async (id: string, userData: Partial<AppUser>) => {
    try {
      const input: UpdateUserInput = {
        id,
        ...userData
      };
      
      await client.graphql({
        query: updateUser,
        variables: { input }
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError('Erro ao atualizar usuário.');
    }
  };

  // Excluir um usuário
  const handleDeleteUser = async (id: string) => {
    try {
      const input: DeleteUserInput = { id };
      
      await client.graphql({
        query: deleteUser,
        variables: { input }
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError('Erro ao excluir usuário.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-red-400">{error || 'Você não tem permissão para acessar esta página.'}</p>
        <a href="/" className="mt-4 text-blue-400 hover:underline">Voltar para a página inicial</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-2 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Usuários</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Função</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: AppUser) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role || 'user'}</td>
                  <td className="px-4 py-3 flex space-x-2">
                    <button 
                      onClick={() => handleUpdateUser(user.id, { role: 'admin' })}
                      className="px-3 py-1 bg-blue-600 rounded-md text-sm"
                    >
                      Tornar Admin
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-3 py-1 bg-red-600 rounded-md text-sm"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}