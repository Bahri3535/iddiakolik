import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Prediction from '@/models/Prediction';
import Match from '@/models/Match';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { matchId, homeScore, awayScore } = await req.json();

    // Veri doğrulama
    if (typeof homeScore !== 'number' || typeof awayScore !== 'number' || !matchId) {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }

    // MongoDB ObjectId doğrulaması
    if (!matchId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Geçersiz maç ID formatı' },
        { status: 400 }
      );
    }

    await connectDB();

    // Maçı kontrol et
    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json(
        { error: 'Maç bulunamadı' },
        { status: 404 }
      );
    }

    if (match.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Bu maç için tahmin yapamazsınız' },
        { status: 400 }
      );
    }

    // Mevcut tahmini kontrol et
    let prediction = await Prediction.findOne({
      user: session.user.id,
      match: matchId,
    });

    if (prediction) {
      // Mevcut tahmini güncelle
      prediction.prediction = {
        homeScore,
        awayScore,
      };
      await prediction.save();
    } else {
      // Yeni tahmin oluştur
      prediction = await Prediction.create({
        user: session.user.id,
        match: matchId,
        prediction: {
          homeScore,
          awayScore,
        },
        points: 0,
        status: 'pending',
      });

      // Maçın tahminler listesine ekle
      await Match.findByIdAndUpdate(matchId, {
        $push: { predictions: prediction._id },
      });
    }

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('Tahmin kaydedilirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 