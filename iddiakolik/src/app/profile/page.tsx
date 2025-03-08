'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Prediction {
  _id: string;
  match: {
    _id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    status: string;
    result?: {
      homeScore: number;
      awayScore: number;
    };
  } | null;
  prediction: {
    homeScore: number;
    awayScore: number;
  };
  points: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPredictions();
    }
  }, [status, router]);

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/profile/predictions');
      const data = await res.json();
      if (res.ok) {
        // Null match olan tahminleri filtrele
        const validPredictions = data.filter((pred: Prediction) => pred.match !== null);
        setPredictions(validPredictions);
      }
    } catch (error) {
      console.error('Tahminler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profilim</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Kullanıcı Bilgileri</h2>
        <p><strong>İsim:</strong> {session?.user?.name}</p>
        <p><strong>Email:</strong> {session?.user?.email}</p>
        <p><strong>Toplam Puan:</strong> {predictions.reduce((total, pred) => total + pred.points, 0)}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tahminlerim</h2>
        
        {predictions.length === 0 ? (
          <p>Henüz tahmin yapmadınız.</p>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              prediction.match && (
                <div key={prediction._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {prediction.match.homeTeam} vs {prediction.match.awayTeam}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(prediction.match.matchDate).toLocaleString('tr-TR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Durum: {prediction.match.status === 'upcoming' ? 'Yaklaşan' : prediction.match.status === 'live' ? 'Canlı' : 'Tamamlandı'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tahmininiz</p>
                      <p className="font-bold">
                        {prediction.prediction.homeScore} - {prediction.prediction.awayScore}
                      </p>
                    </div>
                    {prediction.match.status === 'finished' && prediction.match.result && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Sonuç</p>
                        <p className="font-bold">
                          {prediction.match.result.homeScore} - {prediction.match.result.awayScore}
                        </p>
                        <p className="text-sm text-green-600">
                          +{prediction.points} puan
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 