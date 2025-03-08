'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  points: number;
}

export default function AdminLeaderboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);

  useEffect(() => {
    if (status === 'unauthenticated' || (!session?.user?.isAdmin && status !== 'loading')) {
      router.push('/');
      return;
    }

    fetchLeaderboard();
  }, [status, session, router]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/admin/leaderboard');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Puan tablosu yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoints = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/leaderboard', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          points: newPoints,
        }),
      });

      if (res.ok) {
        fetchLeaderboard();
        setEditingUser(null);
        setNewPoints(0);
      }
    } catch (error) {
      console.error('Puan güncellenirken hata:', error);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Puan Tablosu Yönetimi</h1>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İsim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingUser === user._id ? (
                      <input
                        type="number"
                        value={newPoints}
                        onChange={(e) => setNewPoints(Number(e.target.value))}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    ) : (
                      user.points
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingUser === user._id ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleUpdatePoints(user._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setNewPoints(0);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUser(user._id);
                          setNewPoints(user.points);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Düzenle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 