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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureStoreColumns();

    const { slug } = await params;

    // 1. Find store by slug
    const storeResult = await query(
      'SELECT * FROM stores WHERE slug = $1',
      [slug]
    );
    const store = storeResult.rows[0];
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // 2. Get categories for this store
    const categoriesResult = await query(
      'SELECT * FROM categories WHERE store_id = $1 ORDER BY name',
      [store.id]
    );
    const categories = categoriesResult.rows;

    // 3. Get available menus joined with category name
    const menusResult = await query(
      'SELECT m.*, c.name as category_name FROM menus m LEFT JOIN categories c ON m.category_id = c.id WHERE m.store_id = $1 AND m.is_available = true ORDER BY c.name, m.name',
      [store.id]
    );
    const menus = menusResult.rows;

    return NextResponse.json({ store, categories, menus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
