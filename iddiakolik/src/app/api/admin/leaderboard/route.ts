import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}, 'name points')
      .sort({ points: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Puan tablosu getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { userId, points } = await req.json();

    if (!userId || typeof points !== 'number') {
      return NextResponse.json(
        { error: 'Geçersiz veri' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { points } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Puan güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 