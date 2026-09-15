import { tours as defaultTours } from "./tours";
import { getSupabase } from "./supabase";

// 상품 데이터 읽기 (서버 전용).
// - Supabase `tours` 테이블에 행이 있으면 그것을 사용(관리자가 편집한 최신본).
// - 테이블이 비어있거나 Supabase 미설정이면 코드 기본값(tours.js)으로 폴백.
//   → 배포 초기/장애 시에도 상품 페이지가 깨지지 않습니다.

export async function getTours() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tours")
      .select("id, sort, data")
      .order("sort", { ascending: true });
    if (error) throw error;
    if (data && data.length) {
      return data.map((r) => ({ id: r.id, ...r.data }));
    }
  } catch {
    // 무시하고 기본값으로 폴백
  }
  return defaultTours;
}

export async function getTourById(id) {
  const list = await getTours();
  return list.find((t) => t.id === id);
}
