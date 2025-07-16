"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Check, X } from "lucide-react";
import type { UserUpdateData } from "@/types/user";
import useAuthGuard from "@/hooks/useAuthGuard";

// Configuração para evitar pré-renderização estática
export const dynamic = 'force-dynamic';

export default function UserPersonalizationPage() {
  const router = useRouter();
  
  // Usar o hook personalizado para proteção de autenticação com Amplify
  const { isAuthenticated, isAuthChecked, isLoading: authLoading, user: authUser } = useAuthGuard('/login');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [user, setUser] = useState<UserUpdateData>({
    name: "",
    nickname: "",
    avatar: "",
    bio: "",
    theme: "dark"
  });
  
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para controle da primeira renderização
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);
  
  // Carregar os dados do usuário
  useEffect(() => {
    async function loadUserData() {
      try {
        // Se já temos os dados do usuário do hook useAuthGuard, usamos eles
        if (authUser) {
          console.log("Usando dados de usuário do hook de autenticação:", authUser);
          setUser({
            name: authUser.name || "",
            nickname: authUser.nickname || "",
            avatar: authUser.avatar || "",
            bio: authUser.bio || "",
            theme: authUser.theme || "dark"
          });
          
          if (authUser.avatar) {
            setPreviewImage(authUser.avatar);
          }
          return;
        }
        
        // Se não, fazemos uma chamada API para obter os dados
        console.log("Buscando dados do usuário via API");
        const res = await fetch("/api/users/me");
        const data = await res.json();
        
        if (data.success && data.user) {
          setUser({
            name: data.user.name || "",
            nickname: data.user.nickname || "",
            avatar: data.user.avatar || "",
            bio: data.user.bio || "",
            theme: data.user.theme || "dark"
          });
          
          if (data.user.avatar) {
            setPreviewImage(data.user.avatar);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
        setError("Não foi possível carregar seus dados. Tente novamente mais tarde.");
      } finally {
        // Indicar que o setup inicial foi concluído
        setInitialSetupComplete(true);
      }
    }
    
    // Quando a verificação de autenticação for concluída, tente carregar os dados
    if (isAuthChecked && !initialSetupComplete) {
      loadUserData();
    }
  }, [isAuthChecked, authUser, initialSetupComplete]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verificar o tipo do arquivo
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      setError("Formato de imagem inválido. Use JPG, PNG ou GIF.");
      return;
    }
    
    // Verificar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Imagem muito grande. O tamanho máximo é 2MB.");
      return;
    }
    
    // Criar uma URL temporária para a imagem selecionada
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    
    try {
      // Preparar os dados para envio
      const userData = {
        ...user,
        avatar: previewImage || user.avatar
      };
      
      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Perfil atualizado com sucesso!");
      } else {
        setError(data.message || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      setError("Ocorreu um erro ao salvar suas informações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Personalização</h1>
          <p className="text-blue-300">Configure seu perfil como desejar</p>
        </div>
        
        {(authLoading || !isAuthChecked || !initialSetupComplete) ? (
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white">Verificando autenticação...</p>
          </div>
        ) : (
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção de Avatar */}
            <div className="mb-8 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-600 overflow-hidden flex items-center justify-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl text-slate-400 font-bold">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                  
                  {previewImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />
              
              <p className="text-sm text-slate-400">
                Clique no ícone de câmera para fazer upload de sua foto de perfil
              </p>
            </div>
            
            {/* Informações pessoais */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-slate-300 mb-1">
                  Apelido
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={user.nickname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Como deseja ser chamado"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">
                  Biografia
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Conte um pouco sobre você e sua experiência com Magic"
                />
              </div>
              
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-slate-300 mb-1">
                  Tema
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={user.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                  <option value="blue">Azul</option>
                  <option value="green">Verde</option>
                  <option value="red">Vermelho</option>
                </select>
              </div>
            </div>
            
            {/* Botão de salvar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition flex items-center justify-center ${
                  loading 
                    ? "bg-indigo-800 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" size={18} />
                    Salvar alterações
                  </>
                )}
              </button>
            </div>
            
            {/* Mensagens de sucesso/erro */}
            {success && (
              <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-400 text-center">
                {success}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-center">
                {error}
              </div>
            )}
          </form>
        </div>
        )}
      </div>
    </div>
  );
}
