"use client";

import { useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from '@/lib/aws-auth-adapter';
import { API } from 'aws-amplify';
import { listUsers } from '../../src/graphql/queries';
import { updateUser } from '../../src/graphql/mutations';

export default function AdminToolsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar se o usuário atual é um administrador
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userInfo = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Extrair grupos do token de ID (adaptado para a estrutura do adaptador)
        const cognitoGroups = session.tokens?.idToken?.payload['cognito:groups'];
        const groups = Array.isArray(cognitoGroups) ? cognitoGroups : [];
        
        // Verificar se o usuário é admin
        const customRole = session.tokens?.idToken?.payload['custom:role'];
        const isUserAdmin = groups.includes('Admin') || customRole === 'admin';
        
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
      const result = await API.graphql({
        query: listUsers
      });
      
      // Converter os resultados para o formato esperado
      const userItems = result.data.listUsers.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role || 'user'
      }));
      
      setUsers(userItems);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar usuários.');
    }
  };

  // Promover usuário a administrador
  const makeAdmin = async (id: string) => {
    try {
      await API.graphql({
        query: updateUser,
        variables: { 
          input: { 
            id, 
            role: 'admin' 
          } 
        }
      });
      
      // Atualizar a lista de usuários
      fetchUsers();
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      setError('Erro ao promover usuário.');
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
      <h1 className="text-3xl font-bold mb-6">Ferramentas de Administração</h1>
      
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
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role || 'user'}</td>
                  <td className="px-4 py-3 flex space-x-2">
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => makeAdmin(user.id)}
                        className="px-3 py-1 bg-blue-600 rounded-md text-sm"
                      >
                        Tornar Admin
                      </button>
                    )}
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