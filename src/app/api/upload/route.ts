import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, withCookies } from "@/lib/auth-helper";

export const runtime = "nodejs";

const ALLOWED_BUCKETS = ["menus", "logos"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest();
  if (auth.error) return auth.error;

  const { user, res, admin } = auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "menus";

    // Validate bucket
    if (!ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
      return withCookies(res, { error: "Bucket tidak valid" }, 400);
    }

    // Validate file
    if (!file) {
      return withCookies(res, { error: "File tidak ditemukan" }, 400);
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return withCookies(res, { error: "Tipe file tidak didukung" }, 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      return withCookies(res, { error: "File terlalu besar (maks 5MB)" }, 400);
    }

    // Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.id === bucket);
    if (!bucketExists) {
      await admin.storage.createBucket(bucket, { public: true });
    }

    // Generate unique path
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload
    const { error: uploadErr } = await admin.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return withCookies(res, { error: "Gagal mengunggah file" }, 500);
    }

    // Get public URL
    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(path);

    return withCookies(res, { url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return withCookies(res, { error: "Terjadi kesalahan server" }, 500);
  }
}
