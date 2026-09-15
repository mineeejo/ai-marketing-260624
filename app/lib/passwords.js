import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// 글 수정/삭제용 4자리 비밀번호를 안전하게 저장하기 위한 해싱 유틸 (서버 전용).
// 평문 비밀번호는 절대 저장하지 않고, salt:hash 형태로만 보관합니다.

export function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(plain), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(String(plain), salt, 64);
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
}

export function isValidPin(pw) {
  return /^\d{4}$/.test(String(pw ?? ""));
}
