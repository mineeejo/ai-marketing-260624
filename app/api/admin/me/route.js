import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/me → 현재 관리자 로그인 여부
export async function GET() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const session = verifySessionToken(token);
  return NextResponse.json({
    loggedIn: Boolean(session),
    username: session?.username ?? null,
  });
}
