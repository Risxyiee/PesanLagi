import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('insforge_status');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (status === 'error') {
    const errorMsg = searchParams.get('insforge_error') || 'Autentikasi gagal';
    return NextResponse.redirect(`${appUrl}/#login?error=${encodeURIComponent(errorMsg)}`);
  }

  // Exchange the OAuth code for a session token
  try {
    const { error } = await insforge.auth.exchangeCodeForSession(
      searchParams.get('code') || ''
    );
    if (error) {
      return NextResponse.redirect(`${appUrl}/#login?error=${encodeURIComponent(error.message)}`);
    }
  } catch {
    // Continue even if exchange fails — cookie may have been set
  }

  return NextResponse.redirect(`${appUrl}/#login?auth=success`);
}