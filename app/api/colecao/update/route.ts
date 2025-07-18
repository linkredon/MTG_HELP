import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const REGION = process.env.AMZ_REGION || 'us-east-2';
const TABLE_NAME = process.env.NEXT_PUBLIC_DDB_COLLECTIONS_TABLE || 'mtg_collections';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, cards, updatedAt } = body;
    if (!id || !userId) {
      return NextResponse.json({ success: false, error: 'id e userId são obrigatórios' }, { status: 400 });
    }
    if (!Array.isArray(cards)) {
      return NextResponse.json({ success: false, error: 'cards deve ser um array' }, { status: 400 });
    }
    const client = new AWS.DynamoDB.DocumentClient({
      region: REGION,
      accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
    });
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #cards = :cards, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#cards': 'cards',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':cards': cards,
        ':updatedAt': updatedAt || new Date().toISOString(),
        ':userId': userId,
      },
      ConditionExpression: 'userId = :userId',
      ReturnValues: 'ALL_NEW',
    };
    let result;
    try {
      result = await client.update(params).promise();
    } catch (err) {
      console.error('[API] Erro ao executar update:', err);
      return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: result.Attributes });
  } catch (error) {
    console.error('[API] Erro inesperado:', error);
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
} 