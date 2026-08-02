import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan masuk.' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, is_pro',
      [normalizedEmail, password_hash]
    );

    const user = result.rows[0];

    // Auto-create a default store
    const storeName = normalizedEmail.split('@')[0];
    const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await query(
      'INSERT INTO stores (user_id, name, slug) VALUES ($1, $2, $3)',
      [user.id, storeName, storeSlug]
    );

    // Create session
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        token text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id),
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `);
    await query(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, user.id, expiresAt]
    );

    const response = NextResponse.json({ user: { id: user.id, email: user.email, is_pro: user.is_pro } });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    return response;
  } catch (err: any) {
    console.error('Sign-up error:', err.message);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
