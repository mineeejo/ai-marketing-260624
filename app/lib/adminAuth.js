import { createHmac, timingSafeEqual } from "crypto";

// 관리자 인증 (서버 전용).
// - 관리자 계정은 환경변수 ADMIN_USERS 에 "아이디:비번,아이디:비번" 형태로 최대 여러 개 등록.
//   예) ADMIN_USERS=bal:bal1234!,manager:pw2,owner:pw3
//   (아이디에는 ':' 를, 항목 사이에는 ',' 를 구분자로 쓰므로 비번에 ',' 는 피해주세요.)
// - 로그인 성공 시 HMAC 서명된 세션 토큰을 httpOnly 쿠키(joy_admin)로 발급. SESSION_SECRET 으로 서명.

export const ADMIN_COOKIE = "joy_admin";
export const ADMIN_COOKIE_MAXAGE = 60 * 60 * 24 * 30; // 30일

export function getAdminAccounts() {
  const accounts = [];
  const raw = process.env.ADMIN_USERS || "";
  for (const part of raw.split(",")) {
    const s = part.trim();
    if (!s) continue;
    const idx = s.indexOf(":");
    if (idx === -1) continue;
    const username = s.slice(0, idx).trim();
    const password = s.slice(idx + 1);
    if (username && password) accounts.push({ username, password });
  }
  // 레거시: ADMIN_PASSWORD 단일 비번도 계속 지원 (아이디 admin)
  const legacy = process.env.ADMIN_PASSWORD;
  if (legacy && !accounts.some((a) => a.username === "admin")) {
    accounts.push({ username: "admin", password: legacy });
  }
  return accounts;
}

export function verifyCredentials(username, password) {
  return getAdminAccounts().some(
    (a) => a.username === username && a.password === password
  );
}

// 후기 수정/삭제 비밀번호 칸에 '관리자 비번'을 바로 입력하는 경우를 위한 검사.
export function passwordMatchesAnyAdmin(password) {
  if (!password) return false;
  return getAdminAccounts().some((a) => a.password === password);
}

function secret() {
  return process.env.SESSION_SECRET || "";
}
function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

export function createSessionToken(username) {
  const s = secret();
  if (!s) return null;
  const payload = b64url(
    JSON.stringify({ u: username, exp: Date.now() + ADMIN_COOKIE_MAXAGE * 1000 })
  );
  const sig = b64url(createHmac("sha256", s).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  const s = secret();
  if (!s || !token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = b64url(createHmac("sha256", s).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return { username: data.u };
  } catch {
    return null;
  }
}

// NextRequest 에서 관리자 세션 여부 확인
export function isAdminRequest(request) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    return Boolean(verifySessionToken(token));
  } catch {
    return false;
  }
}
