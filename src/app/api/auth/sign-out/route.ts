import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';

export async function POST() {
  try {
    const { error } = await insforge.auth.signOut();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
