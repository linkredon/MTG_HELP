import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export async function POST(req: NextRequest) {
  try {
    // Parse o corpo da solicitação
    const { googleClientId, googleClientSecret, updateEnv } = await req.json();

    // Validar os dados recebidos
    if (!googleClientId || !googleClientSecret) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Client ID e Client Secret são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Preparar resultado
    const result = {
      success: true,
      message: 'Credenciais verificadas',
      envUpdated: false,
      cognitoUpdated: false,
      clientId: googleClientId,
      configStatus: {}
    };

    // Se solicitado, atualizar o arquivo .env.local
    if (updateEnv) {
      try {
        const envFilePath = path.join(process.cwd(), '.env.local');
        
        // Ler o arquivo .env existente ou criar um novo
        let envContent = '';
        if (fs.existsSync(envFilePath)) {
          envContent = fs.readFileSync(envFilePath, 'utf-8');
        }
        
        // Analisar o conteúdo para um objeto
        const envVars = dotenv.parse(envContent);
        
        // Atualizar ou adicionar as variáveis
        envVars.GOOGLE_CLIENT_ID = googleClientId;
        envVars.GOOGLE_CLIENT_SECRET = googleClientSecret;
        
        // Converter de volta para o formato de arquivo .env
        const newEnvContent = Object.entries(envVars)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');
        
        // Escrever de volta para o arquivo
        fs.writeFileSync(envFilePath, newEnvContent);
        
        result.envUpdated = true;
        result.message += ', arquivo .env.local atualizado';
      } catch (error) {
        console.error('Erro ao atualizar arquivo .env.local:', error);
        result.message += ', erro ao atualizar arquivo .env';
      }
    }

    // Verificar configuração atual
    const currentConfig = {
      env: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'Não configurado',
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'Não configurado',
        NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || 'Não configurado',
        NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || 'Não configurado',
        NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'Não configurado'
      }
    };
    
    result.configStatus = currentConfig;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro no endpoint update-oauth-credentials:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
