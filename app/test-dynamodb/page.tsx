'use client';

import { useEffect, useState } from 'react';

export default function TestDynamoDB() {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testDynamoDB = async () => {
      try {
        // Test if the universalDbService can be imported without errors
        const { universalDbService } = await import('@/lib/universalDbService');
        
        // Test a simple operation
        const result = await universalDbService.getByUserId('test_table', 'test_user');
        
        if (result.success !== false) {
          setStatus('✅ DynamoDB client test passed - no client-side errors');
        } else {
          setStatus('⚠️ DynamoDB client test completed with expected server-side fallback');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStatus('❌ DynamoDB client test failed');
      }
    };

    testDynamoDB();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">DynamoDB Client Test</h1>
      <div className="mb-4">
        <p className="text-lg">{status}</p>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      <div className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">
          ← Voltar para a página inicial
        </a>
      </div>
    </div>
  );
} 