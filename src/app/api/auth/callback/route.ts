import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('insforge_status');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (status === 'error') {
    const errorMsg = searchParams.get('insforge_error') || 'Autentikasi gagal';
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  return NextResponse.redirect(`${appUrl}/login?auth=success`);
}