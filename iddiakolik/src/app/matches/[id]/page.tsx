'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getTeamLogo, normalizeTeamName } from '@/utils/teamLogos';

interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: 'upcoming' | 'live' | 'finished';
  result?: {
    homeScore: number;
    awayScore: number;
  };
}

interface Prediction {
  _id: string;
  userId: string;
  matchId: string;
  prediction: {
    homeScore: number;
    awayScore: number;
  };
  points: number;
  createdAt: string;
}

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [match, setMatch] = useState<Match | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchMatch();
      if (session?.user) {
        fetchPrediction();
      }
    }
  }, [params.id, session]);

  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${params.id}`);
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error('API Hatası:', errorData);
        setError('Maç detayı yüklenirken bir hata oluştu');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      setMatch(data);
    } catch (error) {
      console.error('Maç detayı yüklenirken hata:', error);
      setError('Maç detayı yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      const res = await fetch(`/api/predictions/${params.id}`);
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error('API Hatası:', errorData);
        return;
      }
      
      const data = await res.json();
      if (data) {
        setPrediction(data);
        setHomeScore(data.prediction.homeScore.toString());
        setAwayScore(data.prediction.awayScore.toString());
      }
    } catch (error) {
      console.error('Tahmin yüklenirken hata:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: params.id,
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('API Hatası:', errorData);
        throw new Error('Tahmin kaydedilirken bir hata oluştu');
      }

      const data = await res.json();
      setPrediction(data);
      setSuccess('Tahmininiz kaydedildi!');
      setError('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Tahmin kaydedilirken bir hata oluştu');
      }
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Maç bulunamadı
        </div>
      </div>
    );
  }

  const homeTeamNormalized = normalizeTeamName(match.homeTeam);
  const awayTeamNormalized = normalizeTeamName(match.awayTeam);
  const homeTeamLogo = getTeamLogo(homeTeamNormalized);
  const awayTeamLogo = getTeamLogo(awayTeamNormalized);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center space-x-8 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 relative mb-2">
                <Image 
                  src={homeTeamLogo}
                  alt={match.homeTeam}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="font-bold text-xl">{match.homeTeam}</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-gray-400 text-lg mb-2">VS</div>
              {match.result && (
                <div className="bg-gray-800 text-white px-4 py-2 rounded-lg">
                  <div className="font-bold text-2xl">
                    {match.result.homeScore} - {match.result.awayScore}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 relative mb-2">
                <Image 
                  src={awayTeamLogo}
                  alt={match.awayTeam}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="font-bold text-xl">{match.awayTeam}</div>
            </div>
          </div>
          
          <div className="text-gray-600 mb-2">
            {new Date(match.matchDate).toLocaleString('tr-TR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
            ${match.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
              match.status === 'live' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {match.status === 'upcoming' ? 'YAKLAŞAN' : 
             match.status === 'live' ? 'CANLI' : 
             'TAMAMLANDI'}
          </div>
        </div>

        {match.status === 'upcoming' && session && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Tahmin Yap</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {match.homeTeam}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-20 p-2 border rounded-md text-center text-lg"
                    required
                  />
                </div>
                <span className="text-xl font-bold">-</span>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {match.awayTeam}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-20 p-2 border rounded-md text-center text-lg"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Tahmin Gönder
              </button>
            </form>
          </div>
        )}

        {prediction && (
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Tahmininiz</h2>
            <div className="bg-gray-100 max-w-xs mx-auto p-4 rounded-lg text-center">
              <div className="font-bold text-2xl mb-2">
                {prediction.prediction.homeScore} - {prediction.prediction.awayScore}
              </div>
              {match.status === 'finished' && (
                <div className="text-sm font-medium text-blue-600">
                  Kazanılan Puan: {prediction.points}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 