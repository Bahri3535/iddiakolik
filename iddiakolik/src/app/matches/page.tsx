'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
  match: string;
  prediction: {
    homeScore: number;
    awayScore: number;
  };
  points: number;
}

export default function MatchesPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'finished'>('upcoming');

  useEffect(() => {
    fetchMatches();
    if (session?.user) {
      fetchPredictions();
    }
  }, [session]);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (res.ok) {
        setMatches(data);
      }
    } catch (error) {
      console.error('Maçlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/profile/predictions');
      const data = await res.json();
      if (res.ok) {
        // Tahminleri match ID'ye göre düzenle
        const predictionMap = data.reduce((acc: Record<string, Prediction>, prediction: any) => {
          acc[prediction.match._id] = {
            _id: prediction._id,
            match: prediction.match._id,
            prediction: prediction.prediction,
            points: prediction.points
          };
          return acc;
        }, {});
        setPredictions(Object.values(predictionMap));
      }
    } catch (error) {
      console.error('Tahminler yüklenirken hata:', error);
    }
  };

  const getPredictionForMatch = (matchId: string) => {
    return predictions.find(p => p.match === matchId);
  };

  const getScoreColor = (match: Match, prediction?: Prediction) => {
    if (!match.result || !prediction) return '';
    
    const actualHome = match.result.homeScore;
    const actualAway = match.result.awayScore;
    const predHome = prediction.prediction.homeScore;
    const predAway = prediction.prediction.awayScore;
    
    // Tam sonuç tahmini
    if (actualHome === predHome && actualAway === predAway) {
      return 'bg-green-100 border-green-300';
    }
    
    // Doğru galibiyet/beraberlik tahmini
    if (
      (actualHome > actualAway && predHome > predAway) ||
      (actualHome < actualAway && predHome < predAway) ||
      (actualHome === actualAway && predHome === predAway)
    ) {
      return 'bg-blue-50 border-blue-200';
    }
    
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const upcomingMatches = matches.filter(match => match.status !== 'finished');
  const finishedMatches = matches.filter(match => match.status === 'finished');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Maçlar</h1>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Oynanmamış Maçlar
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'finished'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Oynanmış Maçlar
          </button>
        </div>
      </div>

      {/* Oynanmamış Maçlar */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">Yaklaşan maç bulunmuyor.</p>
            </div>
          ) : (
            upcomingMatches.map(match => {
              const prediction = getPredictionForMatch(match._id);
              const homeTeamNormalized = normalizeTeamName(match.homeTeam);
              const awayTeamNormalized = normalizeTeamName(match.awayTeam);
              const homeTeamLogo = getTeamLogo(homeTeamNormalized);
              const awayTeamLogo = getTeamLogo(awayTeamNormalized);
              
              return (
                <Link href={`/matches/${match._id}`} key={match._id}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 border-l-4 border-blue-400">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 relative mr-2">
                              <Image 
                                src={homeTeamLogo}
                                alt={match.homeTeam}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            </div>
                            <div className="font-semibold text-lg">{match.homeTeam}</div>
                          </div>
                          <div className="text-gray-400">vs</div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 relative mr-2">
                              <Image 
                                src={awayTeamLogo}
                                alt={match.awayTeam}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            </div>
                            <div className="font-semibold text-lg">{match.awayTeam}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(match.matchDate).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs font-medium mt-1 inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {match.status === 'live' ? 'CANLI' : 'YAKLAŞAN'}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {prediction ? (
                          <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Tahmininiz</div>
                            <div className="font-bold text-lg text-center">
                              {prediction.prediction.homeScore} - {prediction.prediction.awayScore}
                            </div>
                          </div>
                        ) : session ? (
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Tahmin Yap
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Oynanmış Maçlar */}
      {activeTab === 'finished' && (
        <div className="space-y-4">
          {finishedMatches.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">Tamamlanmış maç bulunmuyor.</p>
            </div>
          ) : (
            finishedMatches.map(match => {
              const prediction = getPredictionForMatch(match._id);
              const scoreColorClass = getScoreColor(match, prediction);
              const homeTeamNormalized = normalizeTeamName(match.homeTeam);
              const awayTeamNormalized = normalizeTeamName(match.awayTeam);
              const homeTeamLogo = getTeamLogo(homeTeamNormalized);
              const awayTeamLogo = getTeamLogo(awayTeamNormalized);
              
              return (
                <Link href={`/matches/${match._id}`} key={match._id}>
                  <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 border-l-4 border-gray-400 ${prediction ? scoreColorClass : ''}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 relative mr-2">
                              <Image 
                                src={homeTeamLogo}
                                alt={match.homeTeam}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            </div>
                            <div className="font-semibold text-lg">{match.homeTeam}</div>
                          </div>
                          <div className="text-gray-400">vs</div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 relative mr-2">
                              <Image 
                                src={awayTeamLogo}
                                alt={match.awayTeam}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            </div>
                            <div className="font-semibold text-lg">{match.awayTeam}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(match.matchDate).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs font-medium mt-1 inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          TAMAMLANDI
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {prediction && (
                          <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Tahmininiz</div>
                            <div className="font-bold text-lg text-center">
                              {prediction.prediction.homeScore} - {prediction.prediction.awayScore}
                            </div>
                            <div className="text-xs text-center mt-1 font-medium text-blue-600">
                              {prediction.points} puan
                            </div>
                          </div>
                        )}
                        
                        {match.result && (
                          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg">
                            <div className="text-xs text-gray-300 mb-1">Sonuç</div>
                            <div className="font-bold text-lg text-center">
                              {match.result.homeScore} - {match.result.awayScore}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
} 