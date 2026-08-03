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

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT m.*, c.name as category_name FROM menus m LEFT JOIN categories c ON m.category_id = c.id WHERE m.store_id = $1';
    const params: any[] = [storeId];
    let idx = 2;

    if (categoryId && categoryId !== 'all') {
      sql += ` AND m.category_id = $${idx++}`;
      params.push(categoryId);
    }
    if (search) {
      sql += ` AND (m.name ILIKE $${idx} OR m.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    sql += ' ORDER BY c.name, m.name';

    const result = await query(sql, params);
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

    const body = await req.json();
    const { id, name, description, price, category_id, image_url, is_available } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Nama menu wajib diisi' }, { status: 400 });
    if (price == null || price < 0) return NextResponse.json({ error: 'Harga tidak valid' }, { status: 400 });

    let result;
    if (id) {
      // Update
      result = await query(
        `UPDATE menus SET name=$1, description=$2, price=$3, category_id=$4, image_url=$5, is_available=$6
         WHERE id = $7 AND store_id = $8 RETURNING *`,
        [name.trim(), description || null, Number(price), category_id || null, image_url || null, is_available !== false, id, storeId]
      );
    } else {
      // Create
      result = await query(
        `INSERT INTO menus (store_id, name, description, price, category_id, image_url, is_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [storeId, name.trim(), description || null, Number(price), category_id || null, image_url || null, is_available !== false]
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const storeId = await getStoreId(userId);
    const { id } = await req.json();

    await query('DELETE FROM menus WHERE id = $1 AND store_id = $2', [id, storeId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}