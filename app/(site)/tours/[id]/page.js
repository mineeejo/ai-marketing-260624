import Link from "next/link";
import { notFound } from "next/navigation";
import { tours, getTour, formatPrice } from "../../../lib/tours";
import { KAKAO_ID } from "../../../lib/site";

export function generateStaticParams() {
  return tours.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }) {
  const tour = getTour(params.id);
  if (!tour) return { title: "상품을 찾을 수 없습니다 | 조이감성투어" };
  return {
    title: `${tour.title} | 조이감성투어`,
    description: tour.summary,
  };
}

export default function TourDetailPage({ params }) {
  const tour = getTour(params.id);
  if (!tour) notFound();

  // 곧 공개되는 코스: 기대감 조성 티저 페이지
  if (tour.comingSoon) {
    return (
      <article style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <div className="soon-hero">{tour.emoji}</div>
        <span className="badge badge-soon">{tour.badge}</span>
        <h1 className="detail-title" style={{ marginTop: 8 }}>
          {tour.title}
        </h1>
        <p className="section-sub" style={{ fontSize: 17 }}>
          {tour.summary}
        </p>
        <p className="section-sub">
          지금 준비 중인 특별한 코스예요. 오픈 소식을 가장 먼저 받아보고 싶다면 카톡으로
          알림 신청해주세요!
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <Link href="/book" className="btn">
            카톡으로 알림 신청 (ID: {KAKAO_ID})
          </Link>
          <Link href="/tours" className="btn btn-ghost">
            다른 상품 보기
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article>
      <div className="detail-hero">
        {tour.image ? <img src={tour.image} alt={tour.title} /> : tour.emoji}
      </div>

      <span className="badge">{tour.badge}</span>
      <h1 className="detail-title">{tour.title}</h1>
      <p className="section-sub">{tour.summary}</p>

      <div className="detail-meta">
        <span className="chip">📍 {tour.region}</span>
        <span className="chip">🗓️ {tour.duration}</span>
        {tour.priceKakao ? (
          <span className="chip chip-price">
            💰 <s>{formatPrice(tour.price, tour.currency)}</s>{" "}
            <strong>{formatPrice(tour.priceKakao, tour.currency)}</strong>{" "}
            <em>카톡가</em>
          </span>
        ) : (
          <span className="chip">💰 {formatPrice(tour.price, tour.currency)}</span>
        )}
      </div>
      {tour.priceNote && (
        <p className="section-sub" style={{ marginTop: -16 }}>
          ※ {tour.priceNote}
        </p>
      )}

      {tour.kakaoDiscount && (
        <div className="kakao-banner">
          💬 <strong>카톡(ID: {KAKAO_ID})</strong> 직접 예약 시 1인당{" "}
          <strong>${tour.kakaoDiscount} 즉시 할인</strong> — {formatPrice(tour.price, tour.currency)}{" "}
          → <strong>{formatPrice(tour.priceKakao, tour.currency)}</strong>
        </div>
      )}

      <section className="detail-section">
        <h2>여행 하이라이트</h2>
        <ul className="itinerary">
          {tour.highlights.map((h, i) => (
            <li key={i}>✨ {h}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h2>상세 일정</h2>
        <ul className="itinerary">
          {tour.itinerary.map((it, i) => (
            <li key={i}>
              <strong>{it.day}</strong> — {it.desc}
            </li>
          ))}
        </ul>
      </section>

      {(tour.included || tour.notIncluded) && (
        <section className="detail-section">
          <h2>포함 / 불포함 사항</h2>
          <div className="incl-grid">
            {tour.included && (
              <div className="incl-box">
                <h3 className="incl-yes">포함</h3>
                <ul>
                  {tour.included.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {tour.notIncluded && (
              <div className="incl-box">
                <h3 className="incl-no">불포함</h3>
                <ul>
                  {tour.notIncluded.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {tour.priceBreakdown && (
            <ul className="price-breakdown">
              {tour.priceBreakdown.map((p, i) => (
                <li key={i}>💵 {p}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tour.notes && (
        <section className="detail-section">
          <h2>예약 전 확인사항</h2>
          <ul className="notes-list">
            {tour.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <Link href="/book" className="btn">
          예약·문의하기
        </Link>
        <Link href="/tours" className="btn btn-ghost">
          다른 상품 보기
        </Link>
      </div>
    </article>
  );
}
