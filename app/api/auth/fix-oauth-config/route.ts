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
    
    // Caminho para o arquivo .env.local
    const envFilePath = path.join(process.cwd(), '.env.local');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(envFilePath)) {
      return NextResponse.json({
        success: false,
        error: 'Arquivo .env.local não encontrado'
      }, { status: 404 });
    }
    
    // Ler o conteúdo atual do arquivo
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Adicionar ou atualizar as variáveis necessárias
    const envVars = {
      // Cogito
      'NEXT_PUBLIC_USER_POOL_ID': process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-2_ExemploPoolID',
      'NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID': process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || 'exemplo_client_id_12345',
      'NEXT_PUBLIC_REGION': process.env.NEXT_PUBLIC_REGION || 'us-east-2',
      
      // OAuth Domain e URLs
      'NEXT_PUBLIC_HOSTED_UI_DOMAIN': process.env.NEXT_PUBLIC_HOSTED_UI_DOMAIN || 'exemplo-dominio-oauth',
      'OAUTH_DOMAIN': process.env.OAUTH_DOMAIN || 'exemplo-dominio-oauth',
      'OAUTH_REDIRECT_SIGNIN': process.env.OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/api/auth/callback/google',
      'OAUTH_REDIRECT_SIGNOUT': process.env.OAUTH_REDIRECT_SIGNOUT || 'http://localhost:3000',
      
      // NextAuth
      'NEXTAUTH_URL': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET || 'mtghelper_nextauth_secret_key',
    };
    
    // Atualizar as variáveis no conteúdo do arquivo
    let updatedContent = envContent;
    let varsAdded = 0;
    let varsUpdated = 0;
    
    for (const [key, value] of Object.entries(envVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(updatedContent)) {
        // Atualizar variável existente
        updatedContent = updatedContent.replace(regex, newLine);
        varsUpdated++;
      } else {
        // Adicionar nova variável
        updatedContent += `\n${newLine}`;
        varsAdded++;
      }
    }
    
    // Gravar no arquivo
    fs.writeFileSync(envFilePath, updatedContent);
    
    return NextResponse.json({
      success: true,
      message: `Configuração atualizada com sucesso. ${varsAdded} variáveis adicionadas e ${varsUpdated} variáveis atualizadas.`,
      varsAdded,
      varsUpdated
    });
    
  } catch (error) {
    console.error('Erro ao tentar corrigir configuração OAuth:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
