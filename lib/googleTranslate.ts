// Função utilitária para traduzir texto usando a API do Google Translate
// É necessário fornecer sua própria API_KEY do Google Cloud Translate
// Veja: https://cloud.google.com/translate/docs/setup

export async function traduzirTextoGoogle(texto: string, targetLang: string = 'pt', apiKey: string): Promise<string> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const body = {
    q: texto,
    target: targetLang,
    format: 'text',
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Erro ao traduzir texto');
  }
  const data = await response.json();
  return data.data.translations[0].translatedText;
}
