'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaFutbol, FaEye, FaBullseye, FaTrophy } from 'react-icons/fa';
import { teamLogos } from '../utils/teamLogos';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  weight: ['800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

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

export default function Home() {
  const { data: session, status } = useSession();
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      const res = await fetch('/api/matches?limit=3');
      const data = await res.json();
      if (res.ok) {
        setUpcomingMatches(data.filter((match: Match) => match.status === 'upcoming').slice(0, 3));
      }
    } catch (error) {
      console.error('Maçlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-pattern">
      {/* Hero Section */}
      <div className="relative overflow-hidden h-[500px] flex items-center justify-center soft-gradient-bg">
        {/* Soft Floating Circles */}
        <div className="floating-circle" style={{ width: '300px', height: '300px', top: '-50px', left: '-50px', animationDelay: '0s' }}></div>
        <div className="floating-circle" style={{ width: '200px', height: '200px', top: '50%', right: '10%', animationDelay: '3s' }}></div>
        <div className="floating-circle" style={{ width: '150px', height: '150px', bottom: '10%', left: '20%', animationDelay: '6s' }}></div>
        <div className="floating-circle" style={{ width: '250px', height: '250px', bottom: '-50px', right: '-50px', animationDelay: '9s' }}></div>
        <div className="floating-circle" style={{ width: '180px', height: '180px', top: '30%', left: '10%', animationDelay: '12s' }}></div>
        
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-indigo-900 opacity-30 z-10"></div>
        
        {/* İçerik */}
        <div className="container mx-auto px-4 text-center relative z-20">
          <div className="flex items-center justify-center mb-4">
            <FaFutbol className="text-4xl mr-2 animate-bounce text-white" />
            <h1 className={`text-4xl md:text-5xl font-extrabold tracking-wider ${montserrat.className} text-white`}>
              İDDİAKOLİK
            </h1>
          </div>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Süperlig ve Avrupa maçları için tahmin platformu
          </p>
          <div className="space-x-4">
            {status === 'authenticated' ? (
              <Link
                href="/matches"
                className="inline-flex items-center bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                <FaEye className="mr-2" />
                Maçlara Göz At
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  <FaFutbol className="mr-2" />
                  Hemen Başla
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center bg-indigo-600 text-white border border-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Giriş Yap
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white bg-opacity-90">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-indigo-800">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4">
                <FaEye className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-800">Maçları Gör</h3>
              <p className="text-gray-600">Süper Lig maçlarını görüntüle ve tahmin etmek istediğin maçları seç.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-4">
                <FaBullseye className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-purple-800">Tahmin Yap</h3>
              <p className="text-gray-600">Maç sonuçlarını tahmin et ve tahminlerini kaydet.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4">
                <FaTrophy className="text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-800">Puan Kazan</h3>
              <p className="text-gray-600">Doğru tahminler yap, puan kazan ve liderlik tablosunda yüksel.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Matches Section */}
      {!loading && upcomingMatches.length > 0 && (
        <div className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-indigo-800">Yaklaşan Maçlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingMatches.map((match) => (
                <Link href={`/matches/${match._id}`} key={match._id}>
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={teamLogos[match.homeTeam]}
                          alt={match.homeTeam}
                          className="w-12 h-12 object-contain"
                        />
                        <div className="font-semibold text-lg text-indigo-800">{match.homeTeam}</div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">VS</div>
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={teamLogos[match.awayTeam]}
                          alt={match.awayTeam}
                          className="w-12 h-12 object-contain"
                        />
                        <div className="font-semibold text-lg text-indigo-800">{match.awayTeam}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 text-center mt-4">
                      {new Date(match.matchDate).toLocaleString('tr-TR')}
                    </div>
                    {session && (
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors">
                          <FaBullseye className="mr-2" />
                          Tahmin Yap
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/matches"
                className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <FaEye className="mr-2" />
                Tüm Maçları Gör
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
