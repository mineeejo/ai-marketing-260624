import { NextResponse } from "next/server";
import { getSupabase } from "../../lib/supabase";
import { uploadReviewImage, ValidationError } from "../../lib/reviewImages";
import { hashPassword, isValidPin } from "../../lib/passwords";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 조회 시 비밀번호 해시는 절대 내려보내지 않습니다.
const PUBLIC_COLS = "id, name, rating, content, image_url, created_at, updated_at";

// GET /api/reviews — 후기 목록 조회
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select(PUBLIC_COLS)
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
    const password = String(form.get("password") ?? "");
    const image = form.get("image");

    if (!name || name.length > 30) {
      return NextResponse.json({ error: "이름은 1~30자로 입력해주세요." }, { status: 400 });
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
    if (!isValidPin(password)) {
      return NextResponse.json(
        { error: "수정/삭제용 비밀번호는 숫자 4자리로 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const imageUrl = await uploadReviewImage(supabase, image);

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        name,
        rating,
        content,
        image_url: imageUrl,
        password_hash: hashPassword(password),
      })
      .select(PUBLIC_COLS)
      .single();

    if (error) throw error;
    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    return NextResponse.json(
      { error: err.message ?? "후기 등록에 실패했습니다." },
      { status }
    );
  }
}
