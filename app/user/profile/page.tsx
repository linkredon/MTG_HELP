"use client";
import React, { useState } from "react";

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchUser() {
    setLoading(true);
    // Logar status da sessão do NextAuth antes de buscar o usuário
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      console.log("[Perfil] Dados da sessão:", sessionData);
    } catch (err) {
      console.log("[Perfil] Erro ao buscar sessão:", err);
    }
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
    fetchUser();
  }, []);

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
