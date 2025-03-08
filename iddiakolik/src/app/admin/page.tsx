'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (!session?.user?.isAdmin && status !== 'loading')) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [status, session, router]);

  const handleResetPoints = async () => {
    if (!confirm('Tüm kullanıcıların puanlarını sıfırlamak ve yeniden hesaplamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setMessage('');
      setError('');
      
      const res = await fetch('/api/admin/reset-points', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setMessage(`${data.message}. ${data.resetUsers} kullanıcının puanı sıfırlandı, ${data.updatedMatches} maç için ${data.updatedPredictions} tahmin hesaplandı ve ${data.updatedUsers} kullanıcının puanı güncellendi.`);
      
      // Kullanıcı puanlarını göster
      if (data.userPoints && data.userPoints.length > 0) {
        console.log('Kullanıcı puanları:');
        data.userPoints.forEach((user: { name: string, email: string, points: number }) => {
          console.log(`${user.name} (${user.email}): ${user.points} puan`);
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Puanlar sıfırlanırken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Paneli</h1>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/matches" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700">
          Maç Yönetimi
        </Link>
        <Link href="/admin/users" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700">
          Kullanıcı Yönetimi
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Sistem İşlemleri</h2>
        <div className="space-y-4">
          <button
            onClick={handleResetPoints}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Tüm Puanları Sıfırla ve Yeniden Hesapla
          </button>
          <p className="text-sm text-gray-600">
            Bu işlem, tüm kullanıcıların puanlarını sıfırlayacak ve mevcut tahminlere göre yeniden hesaplayacaktır.
            Silinen maçlardan kazanılan puanlar da silinecektir.
          </p>
        </div>
      </div>
    </div>
  );
} 