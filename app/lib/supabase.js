import { createClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트. 서비스 롤 키를 사용하므로 절대 클라이언트로 노출하지 않습니다.
// 환경변수는 Vercel 프로젝트 설정 또는 .env.local 에 등록합니다.
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const REVIEW_BUCKET = "review-images";

export function getSupabase() {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
