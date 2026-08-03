import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/pg';

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) return NextResponse.json({ exists: false });

    const result = await query(
      'SELECT id, slug FROM stores WHERE slug = $1',
      [slug.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, id: result.rows[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
