import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Prediction from '@/models/Prediction';
import Match from '@/models/Match';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    await connectDB();

    const predictions = await Prediction.find({ user: session.user.id })
      .populate('match')
      .sort({ createdAt: -1 });

    const validPredictions = predictions.filter(pred => pred.match !== null);

    return NextResponse.json(validPredictions);
  } catch (error) {
    console.error('Tahminler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 