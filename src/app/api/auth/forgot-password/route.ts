import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // TODO: Integrate with InsForge password reset when SDK supports it
    // For now, always return success to prevent email enumeration

    return NextResponse.json({
      message: 'Jika email terdaftar, link reset password telah dikirim.',
    });
  } catch {
    return NextResponse.json({
      message: 'Jika email terdaftar, link reset password telah dikirim.',
    });
  }
}
