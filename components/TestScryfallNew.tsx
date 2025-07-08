"use client"

import { useState } from 'react'

interface TestCard {
  name: string
  image_uris?: {
    normal: string
    small: string
  }
  card_faces?: Array<{
    image_uris?: {
      normal: string
      small: string
    }
  }>
}

export default function TestScryfallNew() {
  const [testCard, setTestCard] = useState<TestCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.scryfall.com/cards/search?q=lightning+bolt&order=name')
      const data = await response.json()
      
      console.log('Dados da API:', data)
      
      if (data.data && data.data.length > 0) {
        setTestCard(data.data[0])
        console.log('Primeira carta:', data.data[0])
        console.log('image_uris:', data.data[0].image_uris)
      } else {
        setError('Nenhuma carta encontrada')
      }
    } catch (err) {
      setError('Erro ao buscar carta: ' + (err instanceof Error ? err.message : String(err)))
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-gray-800 text-white">
      <h2 className="text-xl mb-4">Teste Scryfall API (Novo)</h2>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar API'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-600 rounded">
          {error}
        </div>
      )}
      
      {testCard && (
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <h3 className="text-lg mb-2">{testCard.name}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold">Dados JSON:</h4>
              <pre className="text-xs overflow-auto bg-gray-900 p-2 rounded">
                {JSON.stringify(testCard, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">Teste de Imagem:</h4>
              {testCard.image_uris ? (
                <div className="space-y-2">
                  <p className="text-sm">Normal URL: {testCard.image_uris.normal}</p>
                  <p className="text-sm">Small URL: {testCard.image_uris.small}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs mb-1">Imagem Normal:</p>
                      <img 
                        src={testCard.image_uris.normal} 
                        alt={testCard.name}
                        className="w-32 h-44 object-cover rounded"
                        crossOrigin="anonymous"
                        loading="eager"
                        onLoad={() => console.log('Imagem normal carregada')}
                        onError={(e) => {
                          console.log('Erro ao carregar imagem normal:', e);
                          const target = e.target as HTMLImageElement;
                          if (testCard.image_uris?.small) {
                            console.log('Tentando fallback para small');
                            target.src = testCard.image_uris.small;
                          }
                        }}
                      />
                    </div>
                    
                    <div>
                      <p className="text-xs mb-1">Imagem Small:</p>
                      <img 
                        src={testCard.image_uris.small} 
                        alt={testCard.name}
                        className="w-24 h-33 object-cover rounded"
                        crossOrigin="anonymous"
                        loading="eager"
                        onLoad={() => console.log('Imagem small carregada')}
                        onError={(e) => {
                          console.log('Erro ao carregar imagem small:', e);
                          console.log('URL que falhou:', testCard.image_uris?.small);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : testCard.card_faces?.[0]?.image_uris ? (
                <div>
                  <p className="text-sm mb-2">Carta dupla face - Face 0:</p>
                  <img 
                    src={testCard.card_faces[0].image_uris.normal} 
                    alt={testCard.name}
                    className="w-32 h-44 object-cover rounded"
                    crossOrigin="anonymous"
                    loading="eager"
                    onLoad={() => console.log('Imagem face 0 carregada')}
                    onError={(e) => {
                      console.log('Erro ao carregar imagem face 0:', e);
                      const target = e.target as HTMLImageElement;
                      if (testCard.card_faces?.[0]?.image_uris?.small) {
                        target.src = testCard.card_faces[0].image_uris.small;
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-red-400">Sem image_uris disponível</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
