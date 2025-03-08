import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Prediction from '@/models/Prediction';

export async function GET(
  req: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const matchId = params.matchId;
    
    // MongoDB ObjectId doğrulaması
    if (!matchId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Geçersiz maç ID formatı' },
        { status: 400 }
      );
    }
    
    await connectDB();

    const prediction = await Prediction.findOne({
      user: session.user.id,
      match: matchId,
    });

    if (!prediction) {
      return NextResponse.json(null);
    }

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Tahmin getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 