import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await connectDB();
    
    // MongoDB ObjectId doğrulaması
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Geçersiz maç ID formatı' },
        { status: 400 }
      );
    }
    
    const match = await Match.findById(id);

    if (!match) {
      return NextResponse.json(
        { error: 'Maç bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Maç detayı getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 