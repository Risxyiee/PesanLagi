import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name: name || email.split('@')[0],
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/callback`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 400 });
    }

    if (data?.requireEmailVerification) {
      return NextResponse.json({
        requireEmailVerification: true,
        message: 'Cek email kamu untuk kode verifikasi.',
      });
    }

    // If no email verification required, user is signed in
    return NextResponse.json({
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
