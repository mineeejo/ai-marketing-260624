import Link from "next/link";
import { notFound } from "next/navigation";
import { tours, getTour, formatPrice } from "../../../lib/tours";

export function generateStaticParams() {
  return tours.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }) {
  const tour = getTour(params.id);
  if (!tour) return { title: "상품을 찾을 수 없습니다 | 여행기획 투어" };
  return {
    title: `${tour.title} | 여행기획 투어`,
    description: tour.summary,
  };
}

export default function TourDetailPage({ params }) {
  const tour = getTour(params.id);
  if (!tour) notFound();

  return (
    <article>
      <div className="detail-hero">{tour.emoji}</div>

      <span className="badge">{tour.badge}</span>
      <h1 className="detail-title">{tour.title}</h1>
      <p className="section-sub">{tour.summary}</p>

      <div className="detail-meta">
        <span className="chip">📍 {tour.region}</span>
        <span className="chip">🗓️ {tour.duration}</span>
        <span className="chip">💰 {formatPrice(tour.price)}</span>
      </div>

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

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <Link href="/contact" className="btn">
          예약·문의하기
        </Link>
        <Link href="/" className="btn btn-ghost">
          다른 상품 보기
        </Link>
      </div>
    </article>
  );
}
