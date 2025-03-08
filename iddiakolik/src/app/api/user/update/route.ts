import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { name, email, password } = await req.json();
    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Kullanıcı bilgilerini güncelle
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Şifreyi hash'leyin

    await user.save();

    return NextResponse.json({ message: 'Kullanıcı bilgileri güncellendi' });
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 