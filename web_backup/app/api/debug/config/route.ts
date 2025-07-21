import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Verificar variáveis de ambiente (sem expor valores sensíveis)
    const config = {
      region: {
        AMZ_REGION: !!process.env.AMZ_REGION,
        AWS_REGION: !!process.env.AWS_REGION,
        value: process.env.AMZ_REGION || process.env.AWS_REGION || 'us-east-2'
      },
      credentials: {
        AMZ_ACCESS_KEY_ID: !!process.env.AMZ_ACCESS_KEY_ID,
        AMZ_SECRET_ACCESS_KEY: !!process.env.AMZ_SECRET_ACCESS_KEY,
        AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY
      },
      tables: {
        USERS: process.env.DYNAMODB_USERS_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_USERS_TABLE || 'mtg_users',
        COLLECTIONS: process.env.DYNAMODB_COLLECTIONS_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_COLLECTIONS_TABLE || 'mtg_collections',
        DECKS: process.env.DYNAMODB_DECKS_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_DECKS_TABLE || 'mtg_decks',
        FAVORITES: process.env.DYNAMODB_FAVORITES_TABLE || process.env.NEXT_PUBLIC_DYNAMODB_FAVORITES_TABLE || 'mtg_favorites'
      },
      environment: process.env.NODE_ENV,
      hasCredentials: !!(process.env.AMZ_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)
    };
    
    return NextResponse.json({
      success: true,
      config
    });
    
  } catch (error) {
    console.error('Erro ao verificar configurações:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao verificar configurações', error: error.message },
      { status: 500 }
    );
  }
} 