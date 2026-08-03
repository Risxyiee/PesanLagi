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

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const storeId = await getStoreId(userId);
    if (!storeId) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const { source_id, target_id } = await req.json();
    if (!source_id || !target_id) {
      return NextResponse.json({ error: 'source_id and target_id required' }, { status: 400 });
    }

    // Get sort_order of target menu
    const targetResult = await query(
      'SELECT sort_order FROM menus WHERE id = $1 AND store_id = $2',
      [target_id, storeId]
    );
    if (targetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Target menu not found' }, { status: 404 });
    }
    const targetOrder = targetResult.rows[0].sort_order || 0;

    // Get max sort_order and increment for the source
    const maxResult = await query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM menus WHERE store_id = $1',
      [storeId]
    );
    const nextOrder = maxResult.rows[0].next_order;

    // Move source to just before target (shift everything >= target up by 1)
    await query(
      'UPDATE menus SET sort_order = sort_order + 1 WHERE store_id = $1 AND sort_order >= $2 AND id != $3',
      [storeId, targetOrder, source_id]
    );
    // Place source at target's position
    await query(
      'UPDATE menus SET sort_order = $1 WHERE id = $2 AND store_id = $3',
      [targetOrder, source_id, storeId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
