export const metadata = {
  title: "왜 조이감성투어 | 조이감성투어",
  description: "편안한 차량, 베테랑 가이드의 스토리텔링, 인생샷 명당까지 — 조이감성투어를 추천하는 이유.",
};

const WHY = [
  {
    icon: "🚐",
    title: "편안한 감성 여행",
    desc: "쾌적하고 안락한 최신 차량으로 이동합니다. 장시간 이동도 창밖 풍경을 즐기며 힐링하는 시간으로 채워드려요.",
  },
  {
    icon: "🎙️",
    title: "베테랑 가이드의 스토리텔링",
    desc: "단순한 설명이 아니라 그랜드캐년에 얽힌 역사와 숨은 이야기까지. 마치 한 편의 영화처럼 빠져들게 됩니다.",
  },
  {
    icon: "📸",
    title: "알찬 코스 · 인생샷 명당",
    desc: "오랜 경험과 노하우로 핵심만 콕콕. 현지 가이드만 아는 '인생샷 명당'까지 꼼꼼하게 안내해드려요.",
  },
];

export default function WhyPage() {
  return (
    <article>
      <h1 className="section-title">왜 조이감성투어일까요?</h1>
      <p className="section-sub">
        편안함, 감동, 그리고 인생샷까지 — 다녀온 분들이 추천하는 이유입니다.
      </p>

      <div className="contact-grid">
        {WHY.map((w) => (
          <div key={w.title} className="contact-card">
            <div className="ico">{w.icon}</div>
            <h3>{w.title}</h3>
            <p>{w.desc}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
