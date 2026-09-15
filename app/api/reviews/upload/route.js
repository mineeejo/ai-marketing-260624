import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import { uploadReviewImage, ValidationError } from "../../../lib/reviewImages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/reviews/upload — 사진 1장 업로드(멀티파트) → { url } 반환
// 사진을 한 장씩 올려 Vercel 함수의 요청 용량(4.5MB) 한계를 피합니다.
export async function POST(request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!image || typeof image.arrayBuffer !== "function") {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }
    const supabase = getSupabase();
    const url = await uploadReviewImage(supabase, image);
    if (!url) {
      return NextResponse.json({ error: "이미지 업로드에 실패했습니다." }, { status: 400 });
    }
    return NextResponse.json({ url });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    return NextResponse.json(
      { error: err.message ?? "이미지 업로드에 실패했습니다." },
      { status }
    );
  }
}
