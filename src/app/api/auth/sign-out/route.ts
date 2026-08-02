import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value;
    if (token) {
      await query('DELETE FROM sessions WHERE token = $1', [token]);
    }
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    return response;
  } catch {
    return NextResponse.json({ error: 'Gagal logout' }, { status: 500 });
  }
}
