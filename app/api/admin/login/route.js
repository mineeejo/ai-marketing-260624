import { NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAXAGE,
} from "../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/login  { username, password } → 세션 쿠키 발급
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  if (!process.env.SESSION_SECRET) {
    return NextResponse.json(
      { error: "SESSION_SECRET 환경변수가 설정되지 않았습니다. (배포 환경에 등록 필요)" },
      { status: 500 }
    );
  }
  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const token = createSessionToken(username);
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAXAGE,
  });
  return res;
}
