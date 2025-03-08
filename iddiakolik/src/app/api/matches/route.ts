import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
    
    await connectDB();
    
    let query = Match.find().sort({ matchDate: 1 });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const matches = await query;
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Maçlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 