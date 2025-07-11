"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function UserPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Buscar dados do usuário
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

  // Buscar ao montar
  React.useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Área do Usuário</h1>
          <p className="text-gray-400">Gerencie seu perfil, configurações e preferências</p>
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
              <div className="flex gap-4 mt-4">
                <Link href="/user/profile" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Perfil</Link>
                <Link href="/user/settings" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">Configurações</Link>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={() => import('next-auth/react').then(mod => mod.signOut())}>Logout</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
