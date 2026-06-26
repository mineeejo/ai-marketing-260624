// 그랜드캐년 투어 상품 데이터.
// ⚠️ 코스/가격은 변동이 잦으므로 이 파일만 수정하면 사이트 전체에 반영됩니다.
// price: 숫자(원) 또는 null(→ "가격 문의"로 표시).
export const tours = [
  {
    id: "day",
    emoji: "🌄",
    badge: "당일",
    title: "그랜드캐년 당일투어",
    region: "라스베가스/LA 출발",
    duration: "당일",
    price: null,
    summary:
      "하루 만에 그랜드캐년의 핵심을 즐기는 코스. 후버댐을 지나 웨스트림 전망 포인트와 스카이워크까지.",
    highlights: [
      "후버댐 포토 스탑",
      "그랜드캐년 웨스트림 (이글 포인트)",
      "스카이워크 유리 전망대 (옵션)",
      "한국어 가이드 동행",
    ],
    itinerary: [
      { day: "오전", desc: "라스베가스(또는 LA) 출발 → 후버댐 경유" },
      { day: "낮", desc: "그랜드캐년 웨스트림 도착 → 이글 포인트·구아노 포인트 관람" },
      { day: "오후", desc: "스카이워크 체험(옵션) → 출발지 복귀" },
    ],
  },
  {
    id: "2d1n",
    emoji: "🏜️",
    badge: "1박 2일",
    title: "그랜드캐년 1박 2일",
    region: "LA 출발",
    duration: "1박 2일",
    price: null,
    summary:
      "LA에서 출발해 루트66의 정취를 따라 사우스림까지. 협곡의 일몰과 일출을 모두 담는 여유로운 일정.",
    highlights: [
      "그랜드캐년 사우스림 전망",
      "루트66 (세리그만) 드라이브",
      "협곡 일몰·일출 감상",
      "라스베가스 야경",
    ],
    itinerary: [
      { day: "DAY 1", desc: "LA 출발 → 루트66 세리그만 → 그랜드캐년 사우스림 관광 → 인근 숙박" },
      { day: "DAY 2", desc: "사우스림 일출·오전 관광 → 라스베가스 이동 → 야경 후 일정 종료" },
    ],
  },
  {
    id: "3d2n",
    emoji: "🌌",
    badge: "2박 3일",
    title: "그랜드캐년 2박 3일",
    region: "LA 출발",
    duration: "2박 3일",
    price: null,
    summary:
      "그랜드캐년·앤텔로프캐년·홀슈벤드·자이언캐년까지. 미국 서부 캐년을 한 번에 도는 풀코스 여행.",
    highlights: [
      "그랜드캐년 사우스림",
      "앤텔로프 캐년 & 홀슈벤드",
      "자이언 캐년 국립공원",
      "라스베가스 1박 + 페이지 1박",
    ],
    itinerary: [
      { day: "DAY 1", desc: "LA 출발 → 캘리코 은광촌 → 라스베가스 도착·숙박" },
      { day: "DAY 2", desc: "그랜드캐년 사우스림 → 앤텔로프 캐년 → 홀슈벤드 → 페이지 숙박" },
      { day: "DAY 3", desc: "자이언 캐년 국립공원 → 라스베가스(또는 LA) 복귀" },
    ],
  },
];

export function getTour(id) {
  return tours.find((t) => t.id === id);
}

export function formatPrice(won) {
  if (won == null) return "가격 문의";
  return won.toLocaleString("ko-KR") + "원";
}
