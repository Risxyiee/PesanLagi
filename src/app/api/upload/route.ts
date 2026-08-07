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

/* ------------------------------------------------------------------ */
/*  Magic-byte signatures for common image formats                     */
/* ------------------------------------------------------------------ */
const MAGIC: Record<string, (buf: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png":  (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  "image/gif":  (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
};

async function validateMagicBytes(file: File): Promise<boolean> {
  const checker = MAGIC[file.type];
  if (!checker) return false; // unknown type should not reach here
  const ab = await file.arrayBuffer();
  const buf = new Uint8Array(ab, 0, Math.min(ab.byteLength, 12));
  return checker(buf);
}

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

    // Validate file content matches declared type (magic-byte check)
    if (!(await validateMagicBytes(file))) {
      return withCookies(res, { error: "File tidak valid atau rusak." }, 400);
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
