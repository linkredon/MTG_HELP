"use client";
import { useState } from "react";
import { confirmSignUp } from "../lib/auth-helpers";

export default function ConfirmCodePage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/confirm-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const res = await response.json();
      setLoading(false);
      if (res.success) {
        setResult("Confirmação realizada com sucesso!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setResult(`Erro: ${res.error}`);
      }
    } catch (err) {
      setLoading(false);
      setResult('Erro ao conectar com o servidor.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">MTG Helper</h1>
          <p className="text-gray-400">Confirme seu código de registro recebido por email</p>
        </div>
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl p-6">
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border border-gray-700 bg-gray-900 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Código de confirmação"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              className="border border-gray-700 bg-gray-900 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition" disabled={loading}>
              {loading ? "Confirmando..." : "Confirmar"}
            </button>
          </form>
          {result && <div className={`mt-4 text-lg ${result.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>{result}</div>}
        </div>
      </div>
    </div>
  );
}
