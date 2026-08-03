import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';

async function getUserId(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  const r = await query(
    'SELECT u.id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > now()',
    [token]
  );
  return r.rows[0]?.id || null;
}

async function getStoreId(userId: string) {
  const r = await query('SELECT id FROM stores WHERE user_id = $1', [userId]);
  return r.rows[0]?.id || null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const storeId = await getStoreId(userId);
    if (!storeId) return NextResponse.json([]);

    const result = await query(
      'SELECT * FROM categories WHERE store_id = $1 ORDER BY sort_order, name',
      [storeId]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const storeId = await getStoreId(userId);
    if (!storeId) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });

    const result = await query(
      'INSERT INTO categories (store_id, name) VALUES ($1, $2) RETURNING *',
      [storeId, name.trim()]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    const storeId = await getStoreId(userId);

    // Nullify category_id on menus that belong to this category
    await query('UPDATE menus SET category_id = NULL WHERE category_id = $1', [id]);

    // Then delete the category
    await query('DELETE FROM categories WHERE id = $1 AND store_id = $2', [id, storeId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
