'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTrophy, FaMedal } from 'react-icons/fa';

interface User {
  _id: string;
  name: string;
  points: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Liderlik tablosu yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // İlk 3 kullanıcı için özel renkler
  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-100 border-yellow-400'; // Altın
      case 1: return 'bg-gray-100 border-gray-400'; // Gümüş
      case 2: return 'bg-amber-100 border-amber-400'; // Bronz
      default: return 'bg-white';
    }
  };

  // Sıralama ikonu
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <FaTrophy className="text-yellow-500" />;
      case 1: return <FaTrophy className="text-gray-400" />;
      case 2: return <FaMedal className="text-amber-600" />;
      default: return <span className="font-bold">{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Liderlik Tablosu</h1>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user, index) => (
          <div 
            key={user._id} 
            className={`border rounded-lg shadow-sm overflow-hidden ${getRankColor(index)} ${session?.user?.id === user._id ? 'border-blue-500 border-2' : 'border'}`}
          >
            <div className="flex items-center p-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-4">
                {getRankIcon(index)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg">{user.name}</div>
                {session?.user?.id === user._id && (
                  <div className="text-xs text-blue-600">Bu sizsiniz</div>
                )}
              </div>
              <div className="text-2xl font-bold text-blue-600">{user.points}</div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz hiçbir kullanıcı puan kazanmamış.
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Puanlar, maç tahminlerinize göre hesaplanır.</p>
        <p className="mt-1">Tam sonuç: 10 puan | Doğru galibiyet/beraberlik: 5 puan | Doğru gol farkı: 3 puan | Bir takımın golü: 1 puan</p>
      </div>
    </div>
  );
} 