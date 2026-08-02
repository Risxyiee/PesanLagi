import { NextResponse } from 'next/server';
import { query } from '@/lib/pg';

export async function GET() {
  try {
    const r = await query('SELECT count(*) as total FROM users');
    return NextResponse.json({ ok: true, users: r.rows[0].total });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}