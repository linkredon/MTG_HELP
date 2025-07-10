import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ConfirmCode({ onConfirm }: { onConfirm: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!code) {
      setError('Por favor, insira o código enviado por email.');
      return;
    }

    setError('');
    onConfirm(code);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-800 rounded-md">
      <h2 className="text-lg font-semibold text-white mb-4">Confirmação de Código</h2>
      <p className="text-sm text-gray-400 mb-4">
        Insira o código enviado para o seu email para confirmar sua conta.
      </p>

      <Input
        type="text"
        placeholder="Código de confirmação"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="mb-4"
      />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <Button onClick={handleConfirm} className="w-full bg-blue-500 hover:bg-blue-600">
        Confirmar
      </Button>
    </div>
  );
}
