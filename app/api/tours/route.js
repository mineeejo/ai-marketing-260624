import { NextResponse } from "next/server";
import { getSupabase } from "../../lib/supabase";
import { isAdminRequest } from "../../lib/adminAuth";
import { tours as defaultTours } from "../../lib/tours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/tours — 상품 목록 (DB 우선, 없으면 코드 기본값)
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tours")
      .select("id, sort, data")
      .order("sort", { ascending: true });
    if (error) throw error;
    if (data && data.length) {
      return NextResponse.json({
        tours: data.map((r) => ({ id: r.id, sort: r.sort, ...r.data })),
        source: "db",
      });
    }
    return NextResponse.json({ tours: defaultTours, source: "default" });
  } catch (e) {
    return NextResponse.json({ tours: defaultTours, source: "default", warn: e.message });
  }
}

// POST /api/tours — (관리자) 기본상품 불러오기(seed) 또는 새 상품 생성
export async function POST(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "관리자만 가능합니다." }, { status: 403 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const supabase = getSupabase();

    // 기본 상품을 DB로 불러오기 (편집 시작용) — 테이블이 비어있을 때만
    if (body.seed) {
      const { data: existing } = await supabase.from("tours").select("id");
      if (existing && existing.length) {
        return NextResponse.json({ error: "이미 상품이 등록되어 있습니다." }, { status: 400 });
      }
      const rows = defaultTours.map((t, i) => {
        const { id, ...data } = t;
        return { id, sort: i, data };
      });
      const { error } = await supabase.from("tours").insert(rows);
      if (error) throw error;
      return NextResponse.json({ ok: true, count: rows.length });
    }

    // 새 상품 생성
    const id = String(body.id ?? "").trim();
    if (!/^[a-z0-9-]{2,40}$/.test(id)) {
      return NextResponse.json(
        { error: "상품 ID는 영문 소문자·숫자·하이픈 2~40자로 입력하세요." },
        { status: 400 }
      );
    }
    const { data: dup } = await supabase.from("tours").select("id").eq("id", id);
    if (dup && dup.length) {
      return NextResponse.json({ error: "이미 존재하는 상품 ID입니다." }, { status: 400 });
    }
    const row = { id, sort: Number(body.sort ?? 99), data: body.data ?? {} };
    const { error } = await supabase.from("tours").insert(row);
    if (error) throw error;
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json(
      { error: e.message ?? "상품 저장에 실패했습니다. (Supabase 연결 확인)" },
      { status: 500 }
    );
  }
}
