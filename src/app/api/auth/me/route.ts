import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        token text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id),
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `);

    // Clean expired sessions
    await query('DELETE FROM sessions WHERE expires_at < now()');

    const result = await query(`
      SELECT u.id, u.email, u.is_pro, u.pro_expiry_date
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 AND s.expires_at > now()
    `, [token]);

    if (result.rows.length === 0) {
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.delete('session');
      return res;
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
