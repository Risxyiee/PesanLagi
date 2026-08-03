import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS = ["logos", "menu-images"] as const;
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!bucket || !ALLOWED_BUCKETS.includes(bucket as any))
      return NextResponse.json(
        { error: `Invalid bucket. Allowed: ${ALLOWED_BUCKETS.join(", ")}` },
        { status: 400 }
      );
    if (file.size > MAX_SIZE)
      return NextResponse.json(
        { error: "File terlalu besar. Maksimal 2MB." },
        { status: 400 }
      );
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." },
        { status: 400 }
      );

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a unique file path
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const admin = createSupabaseAdminClient();

    // Upload to Supabase Storage
    const { data, error } = await admin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error.message);
      return NextResponse.json(
        { error: "Gagal mengunggah file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = admin.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload" },
      { status: 500 }
    );
  }
}
