import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, withCookies } from '@/lib/auth-helper';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `Kamu adalah AI desainer QR menu untuk restoran/warung di Indonesia. Tugasmu: menerima deskripsi warung, lalu pilih kombinasi warna & template yang paling cocok.

Kembalikan JSON saja, tanpa markdown fence, tanpa penjelasan tambahan:
{
  "bgColor": "#HEX",
  "qrColor": "#HEX", 
  "textColor": "#HEX",
  "accentColor": "#HEX",
  "template": "pesanlagi" | "minimalist" | "rustic" | "dark_gold" | "acrylic",
  "reason": "penjelasan singkat 1 kalimat kenapa warna ini cocok"
}

Panduan pemilihan:
- bgColor: warna latar card, usahakan terang/soft kecuali dark theme
- qrColor: warna modul QR, harus kontras tinggi dengan bg
- textColor: warna judul & teks utama, harus readable
- accentColor: warna aksen (powered by text, badge, highlight)
- template: pilih yang paling cocok dengan vibe warung
  - pesanlagi: cocok untuk umum, brand default, background gelap elegan dengan aksen orange
  - minimalist: cocok untuk umum, bersih, modern, background terang
  - rustic: cocok untuk warung tradisional, kayu, kafe vintage
  - dark_gold: cocok untuk fine dining, bar, lounge, mewah
  - acrylic: cocok untuk modern, minimalis, clean look

Contoh:
- "warung nasi padang" → bg:#FFF7ED, qr:#92400E, text:#1C1917, accent:#EA580C, template:rustic
- "kafe matcha kekinian" → bg:#F0FDF4, qr:#166534, text:#14532D, accent:#22C55E, template:minimalist
- "bar cocktail mewah" → bg:#0F172A, qr:#FBBF24, text:#F1F5F9, accent:#F59E0B, template:dark_gold
- "bakso pedas mangga" → bg:#FEF2F2, qr:#991B1B, text:#1C1917, accent:#EF4444, template:minimalist`;

export async function POST(req: NextRequest) {
  // Rate limit: max 5 per minute per IP (prevents AI credit drain)
  const limited = rateLimit(req, { maxRequests: 5, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const auth = await authenticateRequest();
    if ('error' in auth) return auth.error;
    const { user, res } = auth;

    /* ---- Pro gate (server-side) ---- */
    if (!isAdmin(user.email)) {
      const admin = createSupabaseAdminClient();
      if (!admin) return withCookies(res, { error: 'Terjadi kesalahan server' }, 503);

      const { data: profile } = await admin
        .from('profiles')
        .select('is_pro, pro_expiry_date')
        .eq('id', user.id)
        .single();

      const isProActive =
        profile?.is_pro === true &&
        profile?.pro_expiry_date &&
        new Date(profile.pro_expiry_date as string).getTime() > Date.now();

      if (!isProActive) {
        return withCookies(res, { error: 'Fitur ini khusus pengguna Pro.' }, 403);
      }
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Deskripsi warung minimal 3 karakter' },
        { status: 400 }
      );
    }

    /* ---- Gemini API call ---- */
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Fitur AI belum dikonfigurasi' },
        { status: 503 }
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: SYSTEM_PROMPT + '\n\nWarung/resto: "' + prompt.trim() + '"' }] },
          ],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!geminiRes.ok) {
      console.error('Gemini API error:', geminiRes.status, await geminiRes.text());
      return NextResponse.json(
        { error: 'Gagal membuat tema AI. Coba lagi.' },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      return NextResponse.json(
        { error: 'AI tidak memberikan respons' },
        { status: 500 }
      );
    }

    /* ---- Parse & validate (unchanged logic) ---- */
    let parsed: Record<string, string>;
    try {
      const clean = raw.replace(/```json\s*|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'Gagal mem-parse respons AI' },
        { status: 500 }
      );
    }

    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    const bgColor = hexRegex.test(parsed.bgColor) ? parsed.bgColor : '#FFFFFF';
    const qrColor = hexRegex.test(parsed.qrColor) ? parsed.qrColor : '#0F172A';
    const textColor = hexRegex.test(parsed.textColor) ? parsed.textColor : '#0F172A';
    const accentColor = hexRegex.test(parsed.accentColor) ? parsed.accentColor : '#F59E0B';
    const validTemplates = ['pesanlagi', 'minimalist', 'rustic', 'dark_gold', 'acrylic'];
    const template = validTemplates.includes(parsed.template) ? parsed.template : 'minimalist';
    const reason = typeof parsed.reason === 'string' ? parsed.reason : 'Desain yang cocok untuk warungmu!';

    return withCookies(res, { bgColor, qrColor, textColor, accentColor, template, reason });
  } catch (err: unknown) {
    console.error('AI generate theme error:', err);
    return NextResponse.json(
      { error: 'Gagal membuat tema AI. Coba lagi.' },
      { status: 500 }
    );
  }
}
