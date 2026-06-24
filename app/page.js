import Link from "next/link";
import { tours, formatPrice } from "./lib/tours";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>
          잊지 못할 여행,
          <br />
          여행기획 투어와 함께
        </h1>
        <p>
          국내 힐링 여행부터 해외 미식·휴양까지. 엄선한 투어 상품을 둘러보고,
          먼저 다녀온 분들의 생생한 후기를 확인해보세요.
        </p>
        <Link href="/reviews" className="cta">
          여행 후기 보러가기 →
        </Link>
      </section>

      <section>
        <h2 className="section-title">투어 상품 소개</h2>
        <p className="section-sub">지금 가장 사랑받는 여행 코스를 만나보세요.</p>

        <div className="tour-grid">
          {tours.map((t) => (
            <Link key={t.id} href={`/tours/${t.id}`} className="tour-card">
              <div className="thumb">{t.emoji}</div>
              <div className="body">
                <span className="badge">{t.badge}</span>
                <h3>{t.title}</h3>
                <p className="desc">{t.summary}</p>
                <div className="price">
                  {formatPrice(t.price)}{" "}
                  <small>· {t.duration} · {t.region}</small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
