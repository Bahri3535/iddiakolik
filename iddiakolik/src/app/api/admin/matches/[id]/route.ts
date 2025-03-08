import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import User from '@/models/User';

// Maç güncelle
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const id = await Promise.resolve(params.id);
    const updateData = await req.json();

    await connectDB();

    // Maçın önceki durumunu al
    const oldMatch = await Match.findById(id);
    if (!oldMatch) {
      return NextResponse.json(
        { error: 'Maç bulunamadı' },
        { status: 404 }
      );
    }

    // Maçı güncelle
    const match = await Match.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    // Eğer maç tamamlandıysa ve sonuç değiştiyse, tahminleri yeniden puanla
    if (
      updateData.status === 'finished' && 
      updateData.result && 
      (
        oldMatch.status !== 'finished' || 
        !oldMatch.result || 
        oldMatch.result.homeScore !== updateData.result.homeScore || 
        oldMatch.result.awayScore !== updateData.result.awayScore
      )
    ) {
      await calculatePredictionPoints(id, updateData.result);
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Maç güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Maç sil
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const matchId = await Promise.resolve(params.id);

    // MongoDB ObjectId doğrulaması
    if (!matchId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Geçersiz maç ID formatı' },
        { status: 400 }
      );
    }

    // Maçla ilişkili tahminleri bul
    const predictions = await Prediction.find({ match: matchId });
    
    console.log(`Silinen maç için ${predictions.length} tahmin bulundu.`);
    
    // Her tahmin için kullanıcı puanlarını güncelle
    for (const prediction of predictions) {
      if (prediction.points > 0) {
        console.log(`Kullanıcı ${prediction.user} için ${prediction.points} puan düşürülüyor.`);
        
        // Kullanıcının puanını düşür
        await User.findByIdAndUpdate(
          prediction.user,
          { $inc: { points: -prediction.points } }
        );
      }
    }

    // Tahminleri sil
    await Prediction.deleteMany({ match: matchId });

    // Maçı sil
    const match = await Match.findByIdAndDelete(matchId);

    if (!match) {
      return NextResponse.json(
        { error: 'Maç bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Maç başarıyla silindi',
        affectedPredictions: predictions.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Maç silinirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Tahmin puanlarını hesapla
async function calculatePredictionPoints(matchId: string, result: { homeScore: number, awayScore: number }) {
  try {
    // Maç için tüm tahminleri getir
    const predictions = await Prediction.find({ match: matchId });
    console.log(`${matchId} maçı için ${predictions.length} tahmin bulundu.`);

    for (const prediction of predictions) {
      let points = 0;
      const predHomeScore = prediction.prediction.homeScore;
      const predAwayScore = prediction.prediction.awayScore;
      const actualHomeScore = result.homeScore;
      const actualAwayScore = result.awayScore;

      // Tam sonuç tahmini (10 puan)
      if (predHomeScore === actualHomeScore && predAwayScore === actualAwayScore) {
        points = 10;
      }
      // Doğru galibiyet/beraberlik tahmini (5 puan)
      else if (
        (predHomeScore > predAwayScore && actualHomeScore > actualAwayScore) ||
        (predHomeScore < predAwayScore && actualHomeScore < actualAwayScore) ||
        (predHomeScore === predAwayScore && actualHomeScore === actualAwayScore)
      ) {
        points = 5;
      }
      // Gol farkını doğru tahmin (3 puan)
      else if (predHomeScore - predAwayScore === actualHomeScore - actualAwayScore) {
        points = 3;
      }
      // En azından bir takımın golünü doğru tahmin (1 puan)
      else if (predHomeScore === actualHomeScore || predAwayScore === actualAwayScore) {
        points = 1;
      }

      // Eğer kullanıcının önceden puanı varsa, önce o puanı düşür
      if (prediction.points > 0) {
        await User.findByIdAndUpdate(
          prediction.user,
          { $inc: { points: -prediction.points } }
        );
      }

      // Tahmini güncelle
      prediction.points = points;
      prediction.status = 'calculated';
      await prediction.save();

      // Kullanıcının toplam puanını güncelle
      await User.findByIdAndUpdate(
        prediction.user,
        { $inc: { points: points } }
      );
      
      console.log(`Kullanıcı ${prediction.user} için ${points} puan eklendi.`);
    }
    
    console.log(`${predictions.length} tahmin puanlandırıldı.`);
  } catch (error) {
    console.error('Puanlar hesaplanırken hata:', error);
  }
} 