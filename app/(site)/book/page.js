import Link from "next/link";
import { KAKAO_ID } from "../../lib/site";
import { tours, formatPrice } from "../../lib/tours";

export const metadata = {
  title: "예약 · 문의 | 조이감성투어",
  description: "그랜드캐년 투어 예약·할인 문의는 카카오톡으로. Kakao ID : 2050hj",
};

const KAKAO_REASONS = [
  {
    icon: "🛡️",
    title: "자체 환불규정 적용",
    desc: "타 중계 사이트 이용 시에는 출발 30일 전까지만 전액 환불됩니다. 카톡 직접 예약은 자체 환불규정이 적용돼요.",
  },
  {
    icon: "🕐",
    title: "한국 상담사 24시간 상담",
    desc: "조이감성투어 한국 예약 상담사와 24시간 편하게 상담하실 수 있습니다.",
  },
  {
    icon: "💸",
    title: "투어비 즉시 할인 혜택",
    desc: "카톡 직접 예약 시 상품별로 1인당 할인 적용 해드려요!",
  },
];

export default function BookPage() {
  const bookable = tours.filter((t) => !t.comingSoon && t.kakaoDiscount);

  return (
    <article style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 className="section-title" style={{ textAlign: "center" }}>
        예약 · 문의
      </h1>
      <p className="section-sub" style={{ textAlign: "center" }}>
        그랜드캐년 투어 예약과 할인 문의는 카카오톡으로 편하게 연락주세요.
      </p>

      {/* 카톡 문의 카드 */}
      <div className="contact-card" style={{ marginTop: 24, textAlign: "center" }}>
        <div className="ico">💬</div>
        <h3 style={{ marginTop: 12 }}>카카오톡 문의 / 예약</h3>
        <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 6 }}>
          조이감성투어 카카오톡 ID
        </p>
        <p className="kakao-id-big">{KAKAO_ID}</p>
        <p className="section-sub" style={{ marginTop: 10, fontSize: 14 }}>
          카카오톡에서 위 ID로 검색해 문의·예약해주세요. 단독투어도 가능합니다.
        </p>
      </div>

      {/* 왜 카카오톡으로 직접 예약해야 할까요? */}
      <section className="detail-section" style={{ marginTop: 36 }}>
        <h2 style={{ textAlign: "center" }}>카카오톡으로 직접 예약해야 하는 이유 📢</h2>
        <div className="reason-grid">
          {KAKAO_REASONS.map((r, i) => (
            <div key={i} className="reason-card">
              <div className="reason-ico">{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 상품별 카톡 할인가 */}
      <section className="detail-section">
        <h2 style={{ textAlign: "center" }}>카톡 예약 시 할인가 💚</h2>
        <div className="discount-list">
          {bookable.map((t) => (
            <Link key={t.id} href={`/tours/${t.id}`} className="discount-row">
              <span className="d-title">{t.title}</span>
              <span className="d-price">
                <s>{formatPrice(t.price, t.currency)}</s>
                <strong>{formatPrice(t.priceKakao, t.currency)}</strong>
                <em>1인당 ${t.kakaoDiscount} 할인</em>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="contact-card" style={{ textAlign: "center", background: "var(--accent-soft)", border: "none" }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
          할인 상담 / 예약 문의는?
        </p>
        <p className="kakao-id-big" style={{ marginTop: 4 }}>카톡 ID : {KAKAO_ID}</p>
      </div>
    </article>
  );
}
