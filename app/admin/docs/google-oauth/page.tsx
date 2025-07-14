'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export default function GoogleOAuthDocumentation() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        const response = await fetch('/docs/google-oauth-guide.md');
        const text = await response.text();
        
        // Processar o markdown para HTML
        const result = await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeStringify)
          .process(text);
        
        setContent(result.toString());
      } catch (error) {
        console.error('Erro ao carregar documentação:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentation();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documentação do Google OAuth</h1>
        <Link href="/admin/google-oauth-setup" className="text-blue-500 hover:underline">
          Ir para Configuração
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando documentação...</div>
        </div>
      ) : (
        <div 
          className="prose prose-slate max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
