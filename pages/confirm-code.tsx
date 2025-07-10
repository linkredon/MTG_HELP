import ConfirmCode from '@/components/ConfirmCode';
import { useRouter } from 'next/router';

export default function ConfirmCodePage() {
  const router = useRouter();

  const handleConfirm = async (code: string) => {
    try {
      // Enviar o código para o backend
      const response = await fetch('/api/confirm-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Erro ao confirmar o código.');
      }

      // Redirecionar após confirmação
      router.push('/success');
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return <ConfirmCode onConfirm={handleConfirm} />;
}
