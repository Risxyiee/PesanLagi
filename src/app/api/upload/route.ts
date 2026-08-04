import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    const user = await supabase.auth.getUser();
    if (!user.data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bucketName = bucket || "uploads";
    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    // Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === bucketName);
    if (!bucketExists) {
      await admin.storage.createBucket(bucketName, { public: true });
    }

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${user.data.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
