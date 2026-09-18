import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 400 });
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

    // Find or create user
    let user = await query('SELECT id, email, is_pro FROM users WHERE email = $1', [email]);
    let userId: string;

    if (user.rows.length === 0) {
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

    const response = NextResponse.json({ success: true });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    return response;
  } catch (err: any) {
    console.error('Google sync error:', err.message);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
