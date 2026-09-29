import { NextResponse } from "next/server";
import { getSupabase } from "../../lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/keepalive — Vercel Cron이 매일 호출.
// Supabase에 가벼운 읽기 요청을 보내 "활동"으로 기록 → 무료 플랜 자동 일시정지 방지.
export async function GET() {
  try {
    const supabase = getSupabase();
    await supabase.from("tours").select("id").limit(1);
    await supabase.from("reviews").select("id").limit(1);
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    // 크론이 실패로 뜨지 않게 200으로 응답 (다음 날 다시 시도)
    return NextResponse.json({ ok: false, error: e.message ?? "keepalive error" });
  }
}
