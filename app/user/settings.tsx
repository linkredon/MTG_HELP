"use client";
import { useState, useEffect } from "react";
import useAuthGuard from "@/hooks/useAuthGuard";

// Configuração para evitar pré-renderização estática
export const dynamic = 'force-dynamic';

export default function UserSettingsPage() {
  // Usar o hook personalizado para proteção de autenticação
  const { isAuthenticated, isAuthChecked } = useAuthGuard('/login');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState(true);
  
  // Carregar configurações quando a autenticação estiver verificada
  useEffect(() => {
    if (isAuthChecked) {
      // Aqui poderíamos carregar as configurações do usuário do backend
      console.log("Verificação de autenticação concluída, carregando configurações");
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    // Simulação de chamada ao backend
    setTimeout(() => {
      setLoading(false);
      setSuccess("Configurações salvas com sucesso!");
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-gray-400">Personalize sua experiência</p>
        </div>
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <label className="text-white font-semibold">Tema</label>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="border border-gray-700 bg-gray-900 text-white p-2 rounded">
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
            </select>
            <label className="text-white font-semibold">Notificações</label>
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} className="w-5 h-5" />
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
            {success && <div className="text-green-400 text-center mt-2">{success}</div>}
            {error && <div className="text-red-400 text-center mt-2">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
