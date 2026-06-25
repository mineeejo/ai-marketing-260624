import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import {
  uploadReviewImage,
  deleteReviewImage,
  ValidationError,
} from "../../../lib/reviewImages";
import { verifyPassword, isValidPin } from "../../../lib/passwords";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_COLS = "id, name, rating, content, image_url, created_at, updated_at";

// 비밀번호를 검증하고 해당 후기 행을 반환. 실패 시 NextResponse(에러)를 throw 합니다.
async function authorize(supabase, id, password) {
  if (!isValidPin(password)) {
    throw NextResponse.json({ error: "비밀번호는 숫자 4자리입니다." }, { status: 400 });
  }
  const { data: row, error } = await supabase
    .from("reviews")
    .select("id, image_url, password_hash")
    .eq("id", id)
    .single();
  if (error || !row) {
    throw NextResponse.json({ error: "후기를 찾을 수 없습니다." }, { status: 404 });
  }
  if (!verifyPassword(password, row.password_hash)) {
    throw NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }
  return row;
}

// PATCH /api/reviews/:id — 비밀번호 확인 후 글/평점/이미지 수정
export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabase();
    const form = await request.formData();
    const password = String(form.get("password") ?? "");
    const row = await authorize(supabase, params.id, password);

    const update = {};

    if (form.has("content")) {
      const content = String(form.get("content")).trim();
      if (!content || content.length > 2000) {
        return NextResponse.json(
          { error: "후기 내용을 1~2000자로 입력해주세요." },
          { status: 400 }
        );
      }
      update.content = content;
    }

    if (form.has("rating")) {
      const rating = parseInt(String(form.get("rating")), 10);
      if (!(rating >= 1 && rating <= 5)) {
        return NextResponse.json({ error: "평점이 올바르지 않습니다." }, { status: 400 });
      }
      update.rating = rating;
    }

    const removeImage = String(form.get("removeImage") ?? "") === "true";
    const newImage = form.get("image");
    const hasNewImage =
      newImage && typeof newImage.arrayBuffer === "function" && newImage.size > 0;

    if (hasNewImage) {
      update.image_url = await uploadReviewImage(supabase, newImage);
      await deleteReviewImage(supabase, row.image_url); // 이전 사진 정리
    } else if (removeImage) {
      update.image_url = null;
      await deleteReviewImage(supabase, row.image_url);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "수정할 내용이 없습니다." }, { status: 400 });
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("reviews")
      .update(update)
      .eq("id", params.id)
      .select(PUBLIC_COLS)
      .single();
    if (error) throw error;

    return NextResponse.json({ review: data });
  } catch (err) {
    if (err instanceof NextResponse || err?.status) return err; // authorize가 던진 응답
    const status = err instanceof ValidationError ? 400 : 500;
    return NextResponse.json(
      { error: err.message ?? "후기 수정에 실패했습니다." },
      { status }
    );
  }
}

// DELETE /api/reviews/:id — 비밀번호 확인 후 삭제 (?password=1234)
export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabase();
    const password = new URL(request.url).searchParams.get("password") ?? "";
    const row = await authorize(supabase, params.id, password);

    const { error } = await supabase.from("reviews").delete().eq("id", params.id);
    if (error) throw error;
    await deleteReviewImage(supabase, row.image_url);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse || err?.status) return err;
    return NextResponse.json(
      { error: err.message ?? "후기 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
