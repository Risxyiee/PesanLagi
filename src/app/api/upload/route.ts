import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    // Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketNames = (buckets ?? []).map((b) => b.name);
    if (!bucketNames.includes(bucket)) {
      const { error: createErr } = await admin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880,
      });
      if (createErr) {
        console.error("Bucket create error:", createErr.message);
        // Try to continue — bucket might already exist
      }
    }

    // Generate unique path
    const ext = file.name.split(".").pop() || "png";
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const bytes = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadErr } = await admin.storage
      .from(bucket)
      .upload(filePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr.message);
      return NextResponse.json({ error: uploadErr.message || "Gagal mengunggah file" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(filePath);
    const url = urlData.publicUrl;

    return NextResponse.json({ url, name: filePath });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Gagal mengunggah file" }, { status: 500 });
  }
}
