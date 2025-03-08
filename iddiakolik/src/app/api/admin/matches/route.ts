import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Match from '@/models/Match';

// Maçları getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    await connectDB();
    const matches = await Match.find().sort({ matchDate: -1 });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Maçlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni maç ekle
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { homeTeam, awayTeam, matchDate, status } = await req.json();

    if (!homeTeam || !awayTeam || !matchDate) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    await connectDB();

    const match = await Match.create({
      homeTeam,
      awayTeam,
      matchDate,
      status: status || 'upcoming',
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Maç eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 