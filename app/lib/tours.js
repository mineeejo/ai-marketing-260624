// 투어 상품 데이터. 실제 운영 시 이 파일만 수정하면 상품이 갱신됩니다.
export const tours = [
  {
    id: "jeju-3d",
    emoji: "🌊",
    badge: "베스트",
    title: "제주 힐링 3일",
    region: "국내",
    duration: "2박 3일",
    price: 389000,
    summary: "에메랄드 바다와 오름, 그리고 흑돼지까지. 제주의 핵심만 모은 힐링 코스.",
    highlights: ["성산일출봉 일출", "우도 자전거 투어", "프리미엄 오션뷰 숙소", "전 일정 가이드 동행"],
    itinerary: [
      { day: "DAY 1", desc: "공항 픽업 → 성산일출봉 → 섭지코지 → 숙소 체크인" },
      { day: "DAY 2", desc: "우도 페리 → 자전거 투어 → 해녀의 집 점심 → 카페거리" },
      { day: "DAY 3", desc: "오설록 티뮤지엄 → 기념품 쇼핑 → 공항 샌딩" },
    ],
  },
  {
    id: "osaka-4d",
    emoji: "🏯",
    badge: "인기",
    title: "오사카·교토 미식 4일",
    region: "해외",
    duration: "3박 4일",
    price: 749000,
    summary: "도톤보리 먹방부터 교토의 고즈넉한 사찰까지, 간사이를 알차게 즐기는 일정.",
    highlights: ["유니버설 스튜디오 1일권", "교토 기모노 체험", "미슐랭 맛집 식사", "시내 중심가 호텔"],
    itinerary: [
      { day: "DAY 1", desc: "인천 출발 → 오사카 도착 → 도톤보리 야경" },
      { day: "DAY 2", desc: "유니버설 스튜디오 재팬 종일 투어" },
      { day: "DAY 3", desc: "교토 청수사 → 기온거리 → 기모노 체험" },
      { day: "DAY 4", desc: "오사카성 → 자유시간 → 귀국" },
    ],
  },
  {
    id: "danang-5d",
    emoji: "🏖️",
    badge: "특가",
    title: "다낭·호이안 리조트 5일",
    region: "해외",
    duration: "4박 5일",
    price: 899000,
    summary: "5성급 풀빌라에서 즐기는 완벽한 휴양. 호이안 야경과 바나힐까지 한번에.",
    highlights: ["5성급 리조트 4박", "바나힐 골든브릿지", "호이안 등불 야경", "전용 차량 이동"],
    itinerary: [
      { day: "DAY 1", desc: "다낭 도착 → 리조트 체크인 → 자유시간" },
      { day: "DAY 2", desc: "바나힐 골든브릿지 → 프랑스 마을" },
      { day: "DAY 3", desc: "호이안 올드타운 → 등불 보트 투어" },
      { day: "DAY 4", desc: "미케비치 휴양 → 스파 → 야시장" },
      { day: "DAY 5", desc: "기념품 쇼핑 → 귀국" },
    ],
  },
  {
    id: "gyeongju-2d",
    emoji: "⛩️",
    badge: "주말여행",
    title: "경주 역사기행 2일",
    region: "국내",
    duration: "1박 2일",
    price: 219000,
    summary: "천년 고도 경주의 밤과 낮. 불국사부터 황리단길까지 여유롭게 걷는 코스.",
    highlights: ["불국사·석굴암", "동궁과 월지 야경", "황리단길 맛집", "한옥 스테이"],
    itinerary: [
      { day: "DAY 1", desc: "불국사 → 석굴암 → 한옥 체크인 → 동궁과 월지 야경" },
      { day: "DAY 2", desc: "첨성대 → 대릉원 → 황리단길 → 출발지 복귀" },
    ],
  },
];

export function getTour(id) {
  return tours.find((t) => t.id === id);
}

export function formatPrice(won) {
  return won.toLocaleString("ko-KR") + "원";
}
