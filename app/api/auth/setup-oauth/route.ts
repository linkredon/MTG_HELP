import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Verificar se estamos em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        error: 'Esta API só está disponível em ambiente de desenvolvimento'
      }, { status: 403 });
    }
    
    const { clientId, clientSecret, redirectUri } = await req.json();
    
    // Validar os dados
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Client ID e Client Secret são obrigatórios'
      }, { status: 400 });
    }
    
    // Caminho para o arquivo .env.local
    const envFilePath = path.join(process.cwd(), '.env.local');
    
    // Ler o conteúdo atual do arquivo ou começar com um template vazio
    let envContent = '';
    try {
      envContent = fs.existsSync(envFilePath) 
        ? fs.readFileSync(envFilePath, 'utf8') 
        : '';
    } catch (err) {
      console.error('Erro ao ler arquivo .env.local:', err);
    }

    // Atualizar ou adicionar as variáveis de ambiente
    const envVars = {
      GOOGLE_CLIENT_ID: clientId,
      GOOGLE_CLIENT_SECRET: clientSecret,
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'um_segredo_aleatorio_para_nextauth',
    };
    
    // Criar ou atualizar cada variável no conteúdo do arquivo
    let updatedContent = envContent;
    for (const [key, value] of Object.entries(envVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(updatedContent)) {
        // Substituir a linha existente
        updatedContent = updatedContent.replace(regex, newLine);
      } else {
        // Adicionar nova linha
        updatedContent += `\n${newLine}`;
      }
    }
    
    // Gravar no arquivo
    fs.writeFileSync(envFilePath, updatedContent);
    
    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao processar configuração do OAuth:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
