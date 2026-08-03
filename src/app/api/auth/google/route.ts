import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://3kgi95g9.insforge.site';
    const { data, error } = await insforge.auth.signInWithOAuth('google', {
      redirectTo: `${appUrl}/api/auth/callback`,
    });

    if (error) {
      console.error('Google OAuth error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.redirect(data.url!);
  } catch (err: any) {
    console.error('Google OAuth error:', err.message);
    return NextResponse.json({ error: 'Gagal memulai Google OAuth' }, { status: 500 });
  }
}
