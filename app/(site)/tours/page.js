import Link from "next/link";
import { tours, formatPrice } from "../../lib/tours";
import { KAKAO_ID } from "../../lib/site";

export const metadata = {
  title: "투어 상품 | 그랜드캐년 투어",
  description: "그랜드캐년을 즐기는 다양한 투어 코스를 만나보세요.",
};

export default function ToursPage() {
  return (
    <section id="tours">
      <h1 className="section-title">투어 상품 소개</h1>
      <p className="section-sub">
        그랜드캐년을 가장 멋지게 즐기는 코스를 골라보세요. 카톡(ID: {KAKAO_ID}) 직접 예약 시
        투어비 할인 혜택이 있습니다.
      </p>

      <div className="tour-grid">
        {tours.map((t) =>
          t.comingSoon ? (
            <div key={t.id} className="tour-card soon">
              <div className="thumb soon-thumb">{t.emoji}</div>
              <div className="body">
                <span className="badge badge-soon">{t.badge}</span>
                <h3>{t.title}</h3>
                <p className="desc">{t.summary}</p>
                <div className="price soon-price">🔒 곧 공개</div>
              </div>
            </div>
          ) : (
            <Link key={t.id} href={`/tours/${t.id}`} className="tour-card">
              <div className="thumb">
                {t.image ? <img src={t.image} alt={t.title} /> : t.emoji}
                {t.kakaoDiscount ? (
                  <span className="thumb-ribbon">카톡 예약 시 ${t.kakaoDiscount} 할인</span>
                ) : null}
              </div>
              <div className="body">
                <span className="badge">{t.badge}</span>
                <h3>{t.title}</h3>
                <p className="desc">{t.summary}</p>
                <div className="price">
                  {t.priceKakao ? (
                    <>
                      <span className="was">{formatPrice(t.price, t.currency)}</span>{" "}
                      <span className="now">{formatPrice(t.priceKakao, t.currency)}</span>{" "}
                      <small className="kakao-tag">카톡 예약 시</small>
                    </>
                  ) : (
                    formatPrice(t.price, t.currency)
                  )}
                  <div className="price-sub">
                    {t.duration} · {t.region}
                  </div>
                </div>
              </div>
            </Link>
          )
        )}
      </div>

      <p className="section-sub" style={{ marginTop: 28, textAlign: "center" }}>
        더 많은 코스가 곧 공개됩니다. 오픈 소식을 가장 먼저 받고 싶다면{" "}
        <Link href="/book" style={{ color: "var(--accent)", fontWeight: 700 }}>
          카톡으로 미리 알림 신청
        </Link>
        하세요!
      </p>
    </section>
  );
}
