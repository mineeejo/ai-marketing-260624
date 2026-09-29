import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import { deleteReviewImage, MAX_IMAGES } from "../../../lib/reviewImages";
import { verifyPassword, isValidPin } from "../../../lib/passwords";
import { isAdminRequest, passwordMatchesAnyAdmin } from "../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_COLS =
  "id, name, rating, content, image_urls, created_at, updated_at, admin_reply, admin_reply_at";

// 인증 후 해당 후기 행과 관리자 여부를 반환. 실패 시 NextResponse(에러)를 throw.
// 관리자 통과: (1) 관리자 세션 쿠키 로그인 OR (2) 비밀번호에 관리자 비번 직접 입력.
// 일반 사용자: 작성 시 등록한 4자리 PIN 이 일치해야 함.
async function authorize(supabase, id, password, request) {
  const isAdmin = isAdminRequest(request) || passwordMatchesAnyAdmin(password);

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
  if (!isAdmin && !verifyPassword(password, row.password_hash)) {
    throw NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }
  return { row, isAdmin };
}

// PATCH /api/reviews/:id — (JSON) 본문/사진/사장님 답글 수정
// body: { password?, content?, removeImages?, addImageUrls?, adminReply? }
export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabase();
    const body = await request.json().catch(() => ({}));
    const password = String(body.password ?? "");
    const { row, isAdmin } = await authorize(supabase, params.id, password, request);

    const update = {};

    // 사장님(관리자) 답글 — 관리자만
    if (body.adminReply !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: "답글은 관리자만 작성할 수 있습니다." },
          { status: 403 }
        );
      }
      const reply = String(body.adminReply).trim();
      if (reply.length > 1000) {
        return NextResponse.json({ error: "답글은 1000자 이내로 입력해주세요." }, { status: 400 });
      }
      update.admin_reply = reply || null;
      update.admin_reply_at = reply ? new Date().toISOString() : null;
    }

    if (typeof body.content === "string") {
      const content = body.content.trim();
      if (!content || content.length > 2000) {
        return NextResponse.json(
          { error: "후기 내용을 1~2000자로 입력해주세요." },
          { status: 400 }
        );
      }
      update.content = content;
    }

    // 사진 처리
    const existing = Array.isArray(row.image_urls) ? row.image_urls : [];
    if (Array.isArray(body.imageUrls)) {
      // 최종 사진 목록을 통째로 받음 (개별 삭제 + 새 사진 반영)
      const desired = body.imageUrls
        .filter((u) => typeof u === "string" && u)
        .slice(0, MAX_IMAGES);
      const removed = existing.filter((u) => !desired.includes(u));
      for (const u of removed) await deleteReviewImage(supabase, u);
      update.image_urls = desired;
    } else {
      // (구버전 호환) removeImages(전체 삭제) + addImageUrls(이어붙임)
      const removeImages = body.removeImages === true;
      const addUrls = Array.isArray(body.addImageUrls)
        ? body.addImageUrls.filter((u) => typeof u === "string" && u)
        : [];
      if (removeImages || addUrls.length > 0) {
        const kept = removeImages ? [] : existing;
        const combined = [...kept, ...addUrls];
        if (combined.length > MAX_IMAGES) {
          return NextResponse.json(
            { error: `사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.` },
            { status: 400 }
          );
        }
        const removed = existing.filter((u) => !combined.includes(u));
        for (const u of removed) await deleteReviewImage(supabase, u);
        update.image_urls = combined;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "수정할 내용이 없습니다." }, { status: 400 });
    }
    // 본문/사진이 실제로 바뀐 경우에만 '수정됨' 표시 (답글만 단 경우 제외)
    const contentChanged = ["content", "image_urls"].some((k) => k in update);
    if (contentChanged) update.updated_at = new Date().toISOString();

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
    return NextResponse.json(
      { error: err.message ?? "후기 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/reviews/:id — 비밀번호만 확인 (수정 화면 진입 전 검증용). 변경 없음.
export async function POST(request, { params }) {
  try {
    const supabase = getSupabase();
    const body = await request.json().catch(() => ({}));
    const password = String(body.password ?? "");
    await authorize(supabase, params.id, password, request); // 틀리면 여기서 throw
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse || err?.status) return err;
    return NextResponse.json(
      { error: err.message ?? "확인에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/:id — 비밀번호 확인 후 삭제 (?password=1234) / 관리자는 쿠키로
export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabase();
    const password = new URL(request.url).searchParams.get("password") ?? "";
    const { row } = await authorize(supabase, params.id, password, request);

    // 소프트 삭제: 화면에서만 숨기고 DB에는 보관(복구 가능). 사진도 보관.
    let { error } = await supabase
      .from("reviews")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", params.id);

    if (error) {
      // deleted_at 컬럼이 아직 없으면 기존 방식(완전 삭제)으로 폴백
      ({ error } = await supabase.from("reviews").delete().eq("id", params.id));
      if (!error) {
        for (const u of row.image_urls || []) await deleteReviewImage(supabase, u);
      }
    }
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse || err?.status) return err;
    return NextResponse.json(
      { error: err.message ?? "후기 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
