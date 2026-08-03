import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';
import { query } from '@/lib/pg';
import { randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const status = searchParams.get('insforge_status');

  if (status === 'error') {
    const errorMsg = searchParams.get('insforge_error') || 'Autentikasi Google gagal';
    return NextResponse.redirect(`${appUrl}/#login?error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    // Exchange the OAuth code for an InsForge session
    const { data: sessionData, error } = await insforge.auth.exchangeCodeForSession(
      searchParams.get('code') || ''
    );

    if (error || !sessionData?.user) {
      return NextResponse.redirect(`${appUrl}/#login?error=${encodeURIComponent(error?.message || 'Gagal menukar kode OAuth')}`);
    }

    const email = sessionData.user.email;
    if (!email) {
      return NextResponse.redirect(`${appUrl}/#login?error=Tidak ada email dari Google`);
    }

    // Ensure sessions table exists
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        token text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id),
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `);

    // Find or create user in our public.users table
    let user = await query('SELECT id, email, is_pro FROM users WHERE email = $1', [email]);
    let userId: string;

    if (user.rows.length === 0) {
      // Create new user (no password for Google users)
      const newUser = await query(
        'INSERT INTO users (email, password_hash) VALUES ($1, NULL) RETURNING id, email, is_pro',
        [email]
      );
      userId = newUser.rows[0].id;

      // Auto-create store
      const storeName = email.split('@')[0];
      const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await query('INSERT INTO stores (user_id, name, slug) VALUES ($1, $2, $3)', [userId, storeName, storeSlug]);
    } else {
      userId = user.rows[0].id;
    }

    // Create our custom session
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token) DO UPDATE SET expires_at = $3',
      [token, userId, expiresAt]
    );

    const response = NextResponse.redirect(`${appUrl}/#login?auth=success`);
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    return response;
  } catch (err: any) {
    console.error('OAuth callback error:', err.message);
    return NextResponse.redirect(`${appUrl}/#login?error=${encodeURIComponent('Terjadi kesalahan saat login Google')}`);
  }
}
