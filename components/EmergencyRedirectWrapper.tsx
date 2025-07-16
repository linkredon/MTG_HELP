'use client';

import dynamic from 'next/dynamic';

// Carrega o componente EmergencyRedirect apenas no lado do cliente
const EmergencyRedirect = dynamic(() => import('./EmergencyRedirect'), {
  ssr: false,
});

export default function EmergencyRedirectWrapper() {
  return <EmergencyRedirect />;
}
