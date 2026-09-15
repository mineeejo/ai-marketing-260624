import { getSupabase } from "./supabase";

// 메인 랜딩 미리보기용 최근 후기 조회 (서버 전용). 비밀번호 해시는 제외.
const PUBLIC_COLS =
  "id, name, rating, content, image_urls, created_at, admin_reply, admin_reply_at";

export async function getRecentReviews(limit = 3) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select(PUBLIC_COLS)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}
