import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import { isAdminRequest } from "../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/tours/:id — (관리자) 상품 수정
export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "관리자만 가능합니다." }, { status: 403 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const update = { updated_at: new Date().toISOString() };
    if (body.data && typeof body.data === "object") update.data = body.data;
    if (body.sort != null) update.sort = Number(body.sort);
    if (!("data" in update) && !("sort" in update)) {
      return NextResponse.json({ error: "수정할 내용이 없습니다." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tours")
      .update(update)
      .eq("id", params.id)
      .select("id, sort, data")
      .single();
    if (error) throw error;
    return NextResponse.json({ tour: { id: data.id, sort: data.sort, ...data.data } });
  } catch (e) {
    return NextResponse.json(
      { error: e.message ?? "상품 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/tours/:id — (관리자) 상품 삭제
export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "관리자만 가능합니다." }, { status: 403 });
  }
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("tours").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e.message ?? "상품 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
