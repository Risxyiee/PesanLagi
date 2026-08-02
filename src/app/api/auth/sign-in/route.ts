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

    const result = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return NextResponse.json({ error: 'Akun ini belum punya password. Gunakan login Google.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Create session token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session in a simple way using a sessions table (create if not exists)
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        token text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id),
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `);
    await query(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token) DO UPDATE SET expires_at = $3',
      [token, user.id, expiresAt]
    );

    // Clean old sessions
    await query('DELETE FROM sessions WHERE expires_at < now()');

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, is_pro: user.is_pro },
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (err) {
    console.error('Sign-in error:', String(err));
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
