'use client';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

// This page component redirects to the improved collection page
export default function ColecaoSelectorPage() {
  redirect('/colecao-improved');
}
