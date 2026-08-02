import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const { data, error } = await insforge.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    }

    return NextResponse.json({
      user: data.user,
      accessToken: data.accessToken,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
