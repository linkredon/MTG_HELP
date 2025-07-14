'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export default function GoogleLoginGuide() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await fetch('/docs/google-login-user-guide.md');
        const text = await response.text();
        
        // Processar o markdown para HTML
        const result = await unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeStringify)
          .process(text);
        
        setContent(result.toString());
      } catch (error) {
        console.error('Erro ao carregar guia:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGuide();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Como fazer login com Google</h1>
        <Link href="/login" className="text-blue-500 hover:underline">
          Ir para Login
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-300">Carregando guia...</div>
        </div>
      ) : (
        <div 
          className="prose prose-slate max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-li:text-gray-300"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
