'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

export default function AdminMatches() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    matchDate: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editMatchId, setEditMatchId] = useState('');
  const [editFormData, setEditFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    matchDate: '',
    status: 'upcoming' as 'upcoming' | 'live' | 'finished',
    homeScore: '',
    awayScore: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (!session?.user?.isAdmin && status !== 'loading')) {
      router.push('/');
      return;
    }

    fetchMatches();
  }, [status, session, router]);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/admin/matches');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess('Maç başarıyla eklendi');
      setFormData({
        homeTeam: '',
        awayTeam: '',
        matchDate: '',
      });
      fetchMatches();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Maç eklenirken bir hata oluştu');
      }
    }
  };

  const handleUpdateResult = async (matchId: string, homeScore: number, awayScore: number) => {
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: { homeScore, awayScore },
          status: 'finished',
        }),
      });

      if (res.ok) {
        fetchMatches();
      }
    } catch (error) {
      console.error('Sonuç güncellenirken hata:', error);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Bu maçı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Maç başarıyla silindi. ${data.affectedPredictions} tahmin etkilendi.`);
        fetchMatches();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Maç silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Maç silinirken hata:', error);
      setError('Maç silinirken bir hata oluştu');
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditMode(true);
    setEditMatchId(match._id);
    setEditFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      matchDate: new Date(match.matchDate).toISOString().slice(0, 16),
      status: match.status,
      homeScore: match.result?.homeScore?.toString() || '',
      awayScore: match.result?.awayScore?.toString() || '',
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditMatchId('');
    setEditFormData({
      homeTeam: '',
      awayTeam: '',
      matchDate: '',
      status: 'upcoming',
      homeScore: '',
      awayScore: '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData: any = {
        homeTeam: editFormData.homeTeam,
        awayTeam: editFormData.awayTeam,
        matchDate: editFormData.matchDate,
        status: editFormData.status,
      };

      // Eğer sonuç varsa ekle
      if (editFormData.status === 'finished' && editFormData.homeScore && editFormData.awayScore) {
        updateData.result = {
          homeScore: parseInt(editFormData.homeScore),
          awayScore: parseInt(editFormData.awayScore),
        };
      }

      const res = await fetch(`/api/admin/matches/${editMatchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess('Maç başarıyla güncellendi');
      setEditMode(false);
      setEditMatchId('');
      setEditFormData({
        homeTeam: '',
        awayTeam: '',
        matchDate: '',
        status: 'upcoming',
        homeScore: '',
        awayScore: '',
      });
      fetchMatches();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Maç güncellenirken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Maç Yönetimi</h1>

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

      {/* Maç Düzenleme Formu */}
      {editMode && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Maç Düzenle</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ev Sahibi Takım"
                value={editFormData.homeTeam}
                onChange={(e) => setEditFormData({ ...editFormData, homeTeam: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Deplasman Takımı"
                value={editFormData.awayTeam}
                onChange={(e) => setEditFormData({ ...editFormData, awayTeam: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <input
              type="datetime-local"
              value={editFormData.matchDate}
              onChange={(e) => setEditFormData({ ...editFormData, matchDate: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'upcoming' | 'live' | 'finished' })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="upcoming">Yaklaşan</option>
                <option value="live">Canlı</option>
                <option value="finished">Tamamlandı</option>
              </select>
              {editFormData.status === 'finished' && (
                <>
                  <input
                    type="number"
                    placeholder="Ev Sahibi Skor"
                    value={editFormData.homeScore}
                    onChange={(e) => setEditFormData({ ...editFormData, homeScore: e.target.value })}
                    className="w-full p-2 border rounded"
                    min="0"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Deplasman Skor"
                    value={editFormData.awayScore}
                    onChange={(e) => setEditFormData({ ...editFormData, awayScore: e.target.value })}
                    className="w-full p-2 border rounded"
                    min="0"
                    required
                  />
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Güncelle
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Maç Ekleme Formu */}
      {!editMode && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Maç Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ev Sahibi Takım"
                value={formData.homeTeam}
                onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Deplasman Takımı"
                value={formData.awayTeam}
                onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <input
              type="datetime-local"
              value={formData.matchDate}
              onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Maç Ekle
            </button>
          </form>
        </div>
      )}

      {/* Maç Listesi */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Maçlar</h2>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match._id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(match.matchDate).toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Durum: {match.status === 'upcoming' ? 'Yaklaşan' : match.status === 'live' ? 'Canlı' : 'Tamamlandı'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {match.status !== 'finished' && (
                    <>
                      <input
                        type="number"
                        placeholder="Ev"
                        className="w-16 p-1 border rounded"
                        min="0"
                        onChange={(e) => {
                          const homeScore = parseInt(e.target.value);
                          const awayScore = match.result?.awayScore || 0;
                          if (!isNaN(homeScore)) {
                            handleUpdateResult(match._id, homeScore, awayScore);
                          }
                        }}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Dep"
                        className="w-16 p-1 border rounded"
                        min="0"
                        onChange={(e) => {
                          const awayScore = parseInt(e.target.value);
                          const homeScore = match.result?.homeScore || 0;
                          if (!isNaN(awayScore)) {
                            handleUpdateResult(match._id, homeScore, awayScore);
                          }
                        }}
                      />
                    </>
                  )}
                  {match.status === 'finished' && match.result && (
                    <div className="font-semibold mr-4">
                      {match.result.homeScore} - {match.result.awayScore}
                    </div>
                  )}
                  <button
                    onClick={() => handleEditMatch(match)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 