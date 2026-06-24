import { NextResponse } from "next/server";
import { getSupabase, REVIEW_BUCKET } from "../../lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// GET /api/reviews — 후기 목록 조회
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, rating, content, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json({ reviews: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? "후기를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/reviews — 후기 작성 (multipart/form-data, 이미지 선택)
export async function POST(request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const content = String(form.get("content") ?? "").trim();
    const rating = parseInt(String(form.get("rating") ?? "5"), 10);
    const image = form.get("image");

    if (!name || name.length > 30) {
      return NextResponse.json(
        { error: "이름은 1~30자로 입력해주세요." },
        { status: 400 }
      );
    }
    if (!content || content.length > 2000) {
      return NextResponse.json(
        { error: "후기 내용을 1~2000자로 입력해주세요." },
        { status: 400 }
      );
    }
    if (!(rating >= 1 && rating <= 5)) {
      return NextResponse.json({ error: "평점이 올바르지 않습니다." }, { status: 400 });
    }

    const supabase = getSupabase();
    let imageUrl = null;

    if (image && typeof image.arrayBuffer === "function" && image.size > 0) {
      if (!ALLOWED_TYPES.includes(image.type)) {
        return NextResponse.json(
          { error: "이미지는 JPG, PNG, WEBP, GIF 형식만 가능합니다." },
          { status: 400 }
        );
      }
      if (image.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "이미지 용량은 5MB 이하만 가능합니다." },
          { status: 400 }
        );
      }

      const ext = (image.name?.split(".").pop() || "jpg").toLowerCase();
      const key = `${Date.now()}-${Math.round(performance.now())}.${ext}`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { error: upErr } = await supabase.storage
        .from(REVIEW_BUCKET)
        .upload(key, buffer, { contentType: image.type, upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(REVIEW_BUCKET).getPublicUrl(key);
      imageUrl = pub.publicUrl;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({ name, rating, content, image_url: imageUrl })
      .select("id, name, rating, content, image_url, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message ?? "후기 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
