import { NextRequest, NextResponse } from 'next/server';
import { universalDbService } from '@/lib/universalDbService';
import { TABLES } from '@/lib/awsConfig';

export async function GET(req: NextRequest) {
  try {
    // Listar todas as tabelas usando o serviço
    const allTables = [
      TABLES.USERS,
      TABLES.COLLECTIONS, 
      TABLES.DECKS,
      TABLES.FAVORITES
    ];
    
    console.log('Tabelas configuradas:', TABLES);
    
    // Verificar se nossas tabelas existem (testando acesso)
    const tableStatus = {
      users: true, // Assumir que existe se conseguirmos acessar
      collections: true,
      decks: true,
      favorites: true
    };
    
    // Contar itens em cada tabela
    const tableCounts: any = {};
    
    for (const [tableName, exists] of Object.entries(tableStatus)) {
      if (exists) {
        try {
          // Tentar buscar alguns itens para verificar se a tabela existe
          const result = await universalDbService.getAll(TABLES[tableName.toUpperCase() as keyof typeof TABLES], 1);
          tableCounts[tableName] = result.success ? 'Acessível' : 'Erro de acesso';
        } catch (error) {
          console.error(`Erro ao acessar tabela ${tableName}:`, error);
          tableCounts[tableName] = 'Erro';
        }
      } else {
        tableCounts[tableName] = 'Tabela não existe';
      }
    }
    
    return NextResponse.json({
      success: true,
      allTables,
      configuredTables: TABLES,
      tableStatus,
      tableCounts
    });
    
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao verificar tabelas', error: error.message },
      { status: 500 }
    );
  }
} 