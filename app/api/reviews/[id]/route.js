import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import {
  uploadReviewImages,
  deleteReviewImage,
  MAX_IMAGES,
  ValidationError,
} from "../../../lib/reviewImages";
import { verifyPassword, isValidPin } from "../../../lib/passwords";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_COLS = "id, name, rating, content, image_urls, created_at, updated_at";

// 비밀번호를 검증하고 해당 후기 행을 반환. 실패 시 NextResponse(에러)를 throw 합니다.
// 작성자 본인(4자리 PIN) 또는 관리자(마스터 비밀번호 = ADMIN_PASSWORD 환경변수) 통과.
async function authorize(supabase, id, password) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isAdmin = Boolean(adminPassword) && password === adminPassword;

  // 관리자 마스터 비밀번호는 4자리 제한 없이 허용(영문·숫자 등 자유). 일반 사용자는 4자리 PIN.
  if (!isAdmin && !isValidPin(password)) {
    throw NextResponse.json({ error: "비밀번호는 숫자 4자리입니다." }, { status: 400 });
  }
  const { data: row, error } = await supabase
    .from("reviews")
    .select("id, image_urls, password_hash")
    .eq("id", id)
    .single();
  if (error || !row) {
    throw NextResponse.json({ error: "후기를 찾을 수 없습니다." }, { status: 404 });
  }
  // 관리자는 작성자 비밀번호와 무관하게 모든 글 수정/삭제 가능.
  if (!isAdmin && !verifyPassword(password, row.password_hash)) {
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

    // 이미지 수정: removeImages(전체 삭제) + 새 이미지 추가(기존에 이어붙임)
    const removeImages = String(form.get("removeImages") ?? "") === "true";
    const existing = Array.isArray(row.image_urls) ? row.image_urls : [];
    const newUrls = await uploadReviewImages(supabase, form.getAll("image"));

    if (removeImages || newUrls.length > 0) {
      const kept = removeImages ? [] : existing;
      const combined = [...kept, ...newUrls];
      if (combined.length > MAX_IMAGES) {
        return NextResponse.json(
          { error: `사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.` },
          { status: 400 }
        );
      }
      // 삭제 대상(기존 - 유지) 파일 정리
      const removed = existing.filter((u) => !combined.includes(u));
      for (const u of removed) await deleteReviewImage(supabase, u);
      update.image_urls = combined;
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
    for (const u of row.image_urls || []) await deleteReviewImage(supabase, u);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse || err?.status) return err;
    return NextResponse.json(
      { error: err.message ?? "후기 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
