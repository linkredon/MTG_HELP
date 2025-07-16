"use client";
import React, { useState } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";

// Configuração para evitar pré-renderização estática
export const dynamic = 'force-dynamic';

export default function UserProfilePage() {
  // Usar o hook personalizado para proteção de autenticação
  const { isAuthenticated, isAuthChecked } = useAuthGuard('/login');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchUser() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.message || "Erro ao buscar usuário");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
    setLoading(false);
  }

  React.useEffect(() => {
    // Buscar dados do usuário apenas quando a verificação de autenticação estiver concluída
    if (isAuthChecked) {
      fetchUser();
    }
  }, [isAuthChecked]);
  
  // Se estiver carregando, mostrar indicador de carregamento
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Perfil do Usuário</h1>
          <p className="text-gray-400">Veja e edite suas informações pessoais</p>
        </div>
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl p-6">
          {loading ? (
            <div className="text-blue-400 text-center">Carregando...</div>
          ) : error ? (
            <div className="text-red-400 text-center">{error}</div>
          ) : user ? (
            <div className="flex flex-col items-center gap-4">
              <img src={user.avatar || "/default-avatar.png"} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-blue-500 mb-2" />
              <div className="text-lg text-white font-semibold">{user.name || user.email}</div>
              <div className="text-gray-400">{user.email}</div>
              <div className="flex flex-col gap-2 mt-4 w-full">
                <input type="text" className="border border-gray-700 bg-gray-900 text-white p-2 rounded" value={user.name || ""} readOnly />
                <input type="email" className="border border-gray-700 bg-gray-900 text-white p-2 rounded" value={user.email || ""} readOnly />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
