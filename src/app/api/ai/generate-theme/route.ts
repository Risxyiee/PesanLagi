import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `Kamu adalah AI desainer QR menu untuk restoran/warung di Indonesia. Tugasmu: menerima deskripsi warung, lalu pilih kombinasi warna & template yang paling cocok.

Kembalikan JSON saja, tanpa markdown fence, tanpa penjelasan tambahan:
{
  "bgColor": "#HEX",
  "qrColor": "#HEX", 
  "textColor": "#HEX",
  "accentColor": "#HEX",
  "template": "minimalist" | "rustic" | "dark_gold" | "acrylic",
  "reason": "penjelasan singkat 1 kalimat kenapa warna ini cocok"
}

Panduan pemilihan:
- bgColor: warna latar card, usahakan terang/soft kecuali dark theme
- qrColor: warna modul QR, harus kontras tinggi dengan bg
- textColor: warna judul & teks utama, harus readable
- accentColor: warna aksen (powered by text, badge, highlight)
- template: pilih yang paling cocok dengan vibe warung
  - minimalist: cocok untuk umum, bersih, modern
  - rustic: cocok untuk warung tradisional, kayu, kafe vintage
  - dark_gold: cocok untuk fine dining, bar, lounge, mewah
  - acrylic: cocok untuk modern, minimalis, clean look

Contoh:
- "warung nasi padang" → bg:#FFF7ED, qr:#92400E, text:#1C1917, accent:#EA580C, template:rustic
- "kafe matcha kekinian" → bg:#F0FDF4, qr:#166534, text:#14532D, accent:#22C55E, template:minimalist
- "bar cocktail mewah" → bg:#0F172A, qr:#FBBF24, text:#F1F5F9, accent:#F59E0B, template:dark_gold
- "bakso pedas mangga" → bg:#FEF2F2, qr:#991B1B, text:#1C1917, accent:#EF4444, template:minimalist`;

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Deskripsi warung minimal 3 karakter' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Warung/resto: "${prompt.trim()}"`
        }
      ],
      thinking: { type: 'disabled' }
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: 'AI tidak memberikan respons' },
        { status: 500 }
      );
    }

    // Parse JSON dari response AI
    let parsed: Record<string, string>;
    try {
      // Strip markdown code fence jika ada
      const clean = raw.replace(/```json\s*|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: 'Gagal mem-parse respons AI' },
        { status: 500 }
      );
    }

    // Validate hex colors
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    const bgColor = hexRegex.test(parsed.bgColor) ? parsed.bgColor : '#FFFFFF';
    const qrColor = hexRegex.test(parsed.qrColor) ? parsed.qrColor : '#0F172A';
    const textColor = hexRegex.test(parsed.textColor) ? parsed.textColor : '#0F172A';
    const accentColor = hexRegex.test(parsed.accentColor) ? parsed.accentColor : '#F59E0B';
    const validTemplates = ['minimalist', 'rustic', 'dark_gold', 'acrylic'];
    const template = validTemplates.includes(parsed.template) ? parsed.template : 'minimalist';
    const reason = typeof parsed.reason === 'string' ? parsed.reason : 'Desain yang cocok untuk warungmu!';

    return NextResponse.json({
      bgColor,
      qrColor,
      textColor,
      accentColor,
      template,
      reason
    });
  } catch (err: any) {
    console.error('AI generate theme error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
