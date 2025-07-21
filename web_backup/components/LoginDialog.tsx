"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Github, Chrome } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinedAt: string
  collectionsCount: number
  totalCards: number
  achievements: string[]
}

interface LoginDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onLogin: (user: User) => void
}

export default function LoginDialog({ isOpen, setIsOpen, onLogin }: LoginDialogProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simular login (em produção, isso seria uma chamada de API)
    setTimeout(() => {
      if (loginData.email && loginData.password) {
        const mockUser: User = {
          id: '1',
          name: loginData.email.split('@')[0],
          email: loginData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginData.email}`,
          joinedAt: new Date().toISOString(),
          collectionsCount: 3,
          totalCards: 1247,
          achievements: [
            'Primeiro Deck Criado',
            'Colecionador Iniciante',
            'Explorador de Cores'
          ]
        }
        onLogin(mockUser)
        setIsOpen(false)
        setLoginData({ email: '', password: '' })
      } else {
        setError('Por favor, preencha todos os campos')
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    // Simular registro
    setTimeout(() => {
      if (registerData.name && registerData.email && registerData.password) {
        const mockUser: User = {
          id: '1',
          name: registerData.name,
          email: registerData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerData.email}`,
          joinedAt: new Date().toISOString(),
          collectionsCount: 0,
          totalCards: 0,
          achievements: ['Bem-vindo ao MTG Helper!']
        }
        onLogin(mockUser)
        setIsOpen(false)
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' })
      } else {
        setError('Por favor, preencha todos os campos')
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true)
    
    // Simular login social
    setTimeout(() => {
      const mockUser: User = {
        id: '1',
        name: `Usuário ${provider}`,
        email: `usuario@${provider}.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        joinedAt: new Date().toISOString(),
        collectionsCount: 2,
        totalCards: 856,
        achievements: [
          'Login Social',
          'Colecionador Iniciante'
        ]
      }
      onLogin(mockUser)
      setIsOpen(false)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md mtg-modal">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-white mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mb-4 mx-auto shadow-xl">
              <User className="w-8 h-8 text-white" />
            </div>
            Entrar no MTG Helper
          </DialogTitle>
        </DialogHeader>

        <div className="w-full">
          <div className="mtg-tabs mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`mtg-tab ${activeTab === 'login' ? 'mtg-tab-active' : ''}`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`mtg-tab ${activeTab === 'register' ? 'mtg-tab-active' : ''}`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta</span>
            </button>
          </div>

          {activeTab === 'login' && (
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="mtg-label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="mtg-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mtg-label">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="mtg-input pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="quantum-btn w-full primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Entrar</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  Esqueceu sua senha?
                </button>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="space-y-6">
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="mtg-label">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className="mtg-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mtg-label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="mtg-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mtg-label">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="mtg-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mtg-label">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mtg-input pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="quantum-btn w-full primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Criando conta...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Criar Conta</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Divisor */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-400">Ou continue com</span>
            </div>
          </div>

          {/* Login Social */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="quantum-btn compact"
            >
              <Chrome className="w-4 h-4" />
              <span>Google</span>
            </Button>
            <Button
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="quantum-btn compact"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Button>
          </div>

          <div className="text-center text-xs text-slate-500">
            Ao continuar, você concorda com nossos{' '}
            <button className="text-blue-400 hover:text-blue-300 underline">
              Termos de Uso
            </button>{' '}
            e{' '}
            <button className="text-blue-400 hover:text-blue-300 underline">
              Política de Privacidade
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
