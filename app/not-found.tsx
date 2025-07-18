'use client';

import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Página não encontrada</h2>
          <p className="text-gray-400 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <a href="/" className="quantum-btn primary w-full flex items-center justify-center rounded-md bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 transition">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </a>
          
          <button 
            onClick={() => window.history.back()} 
            className="quantum-btn w-full border border-gray-400 bg-transparent text-white py-2 px-4 rounded-md hover:bg-gray-800 transition flex items-center justify-center"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
} 