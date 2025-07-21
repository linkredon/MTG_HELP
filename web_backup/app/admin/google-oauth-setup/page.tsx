'use client';

import GoogleOAuthSetup from '@/components/GoogleOAuthSetup';

export default function GoogleOAuthSetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Configuração do OAuth do Google</h1>
      <GoogleOAuthSetup />
    </div>
  );
}
