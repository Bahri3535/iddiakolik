import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Prediction from '@/models/Prediction';
import Match from '@/models/Match';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    await connectDB();

    // Tüm kullanıcıların puanlarını sıfırla
    const resetResult = await User.updateMany({}, { $set: { points: 0 } });
    console.log(`${resetResult.modifiedCount} kullanıcının puanı sıfırlandı.`);

    // Tüm tahminleri sıfırla
    await Prediction.updateMany({}, { $set: { points: 0, status: 'pending' } });
    console.log('Tüm tahminlerin puanları sıfırlandı.');

    // Tamamlanmış maçları bul
    const finishedMatches = await Match.find({ 
      status: 'finished',
      result: { $exists: true }
    });
    console.log(`${finishedMatches.length} tamamlanmış maç bulundu.`);

    // Her maç için tahminleri yeniden hesapla
    let totalUpdatedPredictions = 0;
    let totalUpdatedUsers = new Set();

    for (const match of finishedMatches) {
      // Maç için tüm tahminleri getir
      const predictions = await Prediction.find({ match: match._id });
      console.log(`${match.homeTeam} vs ${match.awayTeam} maçı için ${predictions.length} tahmin bulundu.`);
      
      for (const prediction of predictions) {
        let points = 0;
        const predHomeScore = prediction.prediction.homeScore;
        const predAwayScore = prediction.prediction.awayScore;
        const actualHomeScore = match.result.homeScore;
        const actualAwayScore = match.result.awayScore;

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

        // Tahmini güncelle
        prediction.points = points;
        prediction.status = 'calculated';
        await prediction.save();
        
        if (points > 0) {
          totalUpdatedPredictions++;
          
          // Kullanıcının toplam puanını güncelle
          await User.findByIdAndUpdate(
            prediction.user,
            { $inc: { points: points } }
          );
          
          totalUpdatedUsers.add(prediction.user.toString());
        }
      }
    }

    console.log(`${totalUpdatedPredictions} tahmin güncellendi.`);
    console.log(`${totalUpdatedUsers.size} kullanıcının puanı güncellendi.`);

    // Tüm kullanıcıların güncel puanlarını getir
    const users = await User.find({}).select('name email points');
    console.log('Kullanıcı puanları:');
    users.forEach(user => {
      console.log(`${user.name} (${user.email}): ${user.points} puan`);
    });

    return NextResponse.json({ 
      message: 'Tüm kullanıcı puanları sıfırlandı ve yeniden hesaplandı',
      resetUsers: resetResult.modifiedCount,
      updatedMatches: finishedMatches.length,
      updatedPredictions: totalUpdatedPredictions,
      updatedUsers: totalUpdatedUsers.size,
      userPoints: users.map(u => ({ name: u.name, email: u.email, points: u.points }))
    });
  } catch (error) {
    console.error('Puanlar sıfırlanırken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 