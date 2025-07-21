import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';

export async function GET(req: NextRequest) {
  try {
    // Tentar diferentes configurações de credenciais
    const configs = [
      {
        name: 'AMZ_* variables',
        client: new DynamoDBClient({
          region: process.env.AMZ_REGION || 'us-east-2',
          credentials: {
            accessKeyId: process.env.AMZ_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY || ''
          }
        })
      },
      {
        name: 'AWS_* variables',
        client: new DynamoDBClient({
          region: process.env.AWS_REGION || 'us-east-2',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
          }
        })
      },
      {
        name: 'Default AWS SDK',
        client: new DynamoDBClient({
          region: 'us-east-2'
        })
      }
    ];

    const results = [];

    for (const config of configs) {
      try {
        console.log(`Testando configuração: ${config.name}`);
        const result = await config.client.send(new ListTablesCommand({}));
        results.push({
          name: config.name,
          success: true,
          tables: result.TableNames || [],
          count: result.TableNames?.length || 0
        });
      } catch (error) {
        console.error(`Erro na configuração ${config.name}:`, error);
        results.push({
          name: config.name,
          success: false,
          error: error.message,
          tables: [],
          count: 0
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      environment: {
        AMZ_REGION: !!process.env.AMZ_REGION,
        AMZ_ACCESS_KEY_ID: !!process.env.AMZ_ACCESS_KEY_ID,
        AMZ_SECRET_ACCESS_KEY: !!process.env.AMZ_SECRET_ACCESS_KEY,
        AWS_REGION: !!process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
        NODE_ENV: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Erro ao testar credenciais:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao testar credenciais', error: error.message },
      { status: 500 }
    );
  }
} 