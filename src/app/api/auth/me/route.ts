import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';

export async function GET() {
  try {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
