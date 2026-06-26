// 그랜드캐년 투어 상품 데이터. 실제 운영 시 이 파일만 수정하면 상품이 갱신됩니다.
export const tours = [
  {
    id: "south-rim-sunrise",
    emoji: "🌅",
    badge: "베스트",
    title: "사우스림 선라이즈 투어",
    region: "그랜드캐년",
    duration: "당일",
    price: 189000,
    summary:
      "동이 트는 협곡의 장관을 가장 좋은 전망 포인트에서. 전문 가이드와 함께하는 인기 코스.",
    highlights: [
      "마더 포인트 일출 감상",
      "전문 가이드 동행 해설",
      "라스베이거스 왕복 차량",
      "소규모 그룹 운영",
    ],
    itinerary: [
      { day: "새벽", desc: "라스베이거스 호텔 픽업 → 사우스림 이동" },
      { day: "일출", desc: "마더 포인트에서 일출 감상 → 가이드 해설" },
      { day: "오전", desc: "야바파이 포인트 트레킹 → 자유 관람 후 복귀" },
    ],
  },
  {
    id: "heli-skywalk",
    emoji: "🚁",
    badge: "인기",
    title: "헬기 + 스카이워크 투어",
    region: "그랜드캐년",
    duration: "당일",
    price: 459000,
    summary:
      "헬리콥터로 협곡 위를 날고, 유리 전망대 스카이워크에서 발아래 절벽을 내려다보는 짜릿한 하루.",
    highlights: [
      "그랜드캐년 웨스트 헬기 투어",
      "스카이워크 유리 전망대",
      "콜로라도강 보트 옵션",
      "전 일정 영어 가이드",
    ],
    itinerary: [
      { day: "오전", desc: "라스베이거스 출발 → 웨스트림 도착" },
      { day: "낮", desc: "헬리콥터 협곡 비행 → 스카이워크 체험" },
      { day: "오후", desc: "이글 포인트 관람 → 라스베이거스 복귀" },
    ],
  },
  {
    id: "colorado-rafting",
    emoji: "🛶",
    badge: "어드벤처",
    title: "콜로라도강 래프팅 1박 2일",
    region: "그랜드캐년",
    duration: "1박 2일",
    price: 749000,
    summary:
      "협곡 사이를 흐르는 콜로라도강에서 즐기는 래프팅과 별빛 캠핑. 평생 잊지 못할 모험.",
    highlights: [
      "급류 래프팅 체험",
      "협곡 강변 캠핑 1박",
      "전문 래프팅 가이드",
      "식사·장비 일체 포함",
    ],
    itinerary: [
      { day: "DAY 1", desc: "출발 → 래프팅 시작 → 강변 캠프 설치 → 별빛 캠핑" },
      { day: "DAY 2", desc: "오전 래프팅 → 협곡 하이킹 → 출발지 복귀" },
    ],
  },
  {
    id: "havasu-hiking",
    emoji: "🥾",
    badge: "한정",
    title: "하바수 폭포 하이킹",
    region: "그랜드캐년",
    duration: "2박 3일",
    price: 1090000,
    summary:
      "에메랄드빛 하바수 폭포까지 걷는 트레킹. 협곡 깊은 곳의 숨은 낙원을 만나는 특별 코스.",
    highlights: [
      "하바수 폭포·무니 폭포",
      "협곡 트레킹 가이드",
      "현지 캠프그라운드 숙박",
      "허가증·입장료 포함",
    ],
    itinerary: [
      { day: "DAY 1", desc: "트레일헤드 출발 → 하바수파이 마을 → 캠프 체크인" },
      { day: "DAY 2", desc: "하바수 폭포 → 무니 폭포 트레킹 → 물놀이" },
      { day: "DAY 3", desc: "일출 트레킹 → 트레일헤드 복귀" },
    ],
  },
];

export function getTour(id) {
  return tours.find((t) => t.id === id);
}

export function formatPrice(won) {
  return won.toLocaleString("ko-KR") + "원";
}
