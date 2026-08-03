import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';

async function ensureStoreColumns() {
  try {
    await query(`
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '';
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS maps_url TEXT DEFAULT '';
      ALTER TABLE stores ADD COLUMN IF NOT EXISTS hours JSONB DEFAULT '{}';
    `);
  } catch {
    // columns may already exist; ignore
  }
}

async function getUser(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  const r = await query(
    'SELECT u.id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > now()',
    [token]
  );
  return r.rows[0]?.id || null;
}

export async function GET(req: NextRequest) {
  try {
    await ensureStoreColumns();

    const userId = await getUser(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query(
      'SELECT id, user_id, name, slug, logo_url, bg_color, qr_color, description, whatsapp, address, maps_url, hours, created_at FROM stores WHERE user_id = $1',
      [userId]
    );
    return NextResponse.json(result.rows[0] || null);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureStoreColumns();

    const userId = await getUser(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const allowed = ['name', 'slug', 'logo_url', 'bg_color', 'qr_color', 'description', 'whatsapp', 'address', 'maps_url', 'hours'];
    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) {
        sets.push(`${key} = $${i++}`);
        values.push(body[key]);
      }
    }
    if (sets.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    values.push(userId);
    const result = await query(
      `UPDATE stores SET ${sets.join(', ')} WHERE user_id = $${i} RETURNING *`,
      values
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
