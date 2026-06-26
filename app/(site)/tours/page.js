import Link from "next/link";
import { tours, formatPrice } from "../../lib/tours";

export const metadata = {
  title: "투어 상품 | 그랜드캐년 투어",
  description: "그랜드캐년을 즐기는 다양한 투어 코스를 만나보세요.",
};

export default function ToursPage() {
  return (
    <section id="tours">
      <h1 className="section-title">투어 상품 소개</h1>
      <p className="section-sub">그랜드캐년을 가장 멋지게 즐기는 코스를 골라보세요.</p>

      <div className="tour-grid">
        {tours.map((t) => (
          <Link key={t.id} href={`/tours/${t.id}`} className="tour-card">
            <div className="thumb">{t.emoji}</div>
            <div className="body">
              <span className="badge">{t.badge}</span>
              <h3>{t.title}</h3>
              <p className="desc">{t.summary}</p>
              <div className="price">
                {formatPrice(t.price, t.currency)}{" "}
                <small>· {t.duration} · {t.region}</small>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
