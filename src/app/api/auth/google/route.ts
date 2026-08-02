import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const { data, error } = await insforge.auth.signInWithOAuth('google', {
      redirectTo: `${appUrl}/api/auth/callback`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.redirect(data.url!);
  } catch {
    return NextResponse.json({ error: 'Gagal memulai Google OAuth' }, { status: 500 });
  }
}
