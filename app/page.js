import Link from "next/link";
import { KAKAO_ID } from "./lib/site";
import { formatPrice } from "./lib/tours";
import { getTours } from "./lib/toursDb";
import { getRecentReviews } from "./lib/reviewsDb";

// 배경 영상 (Higgsfield로 생성한 그랜드캐년 골든아워 항공 영상)
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3CkUAX5vl7hsRPpzsmLNJVSyYqp/hf_20260626_041746_4ec96dc5-b701-4029-9e9f-adc136e500a5.mp4";

const NAV = [
  { href: "#tours", label: "투어 상품" },
  { href: "#why", label: "왜 조이감성투어인가요?" },
  { href: "#reviews", label: "고객 후기" },
];

const WHY = [
  {
    icon: "🚐",
    title: "편안한 감성 여행",
    desc: "쾌적하고 안락한 차량으로 이동합니다. 장시간 이동도 창밖 풍경을 즐기며 힐링하는 시간으로 채워드려요.",
  },
  {
    icon: "🎙️",
    title: "베테랑 가이드의 스토리텔링",
    desc: "단순한 설명이 아니라 그랜드캐년에 얽힌 역사와 숨은 이야기까지. 마치 한 편의 영화처럼 빠져들게 됩니다.",
  },
  {
    icon: "📸",
    title: "알찬 코스 · 인생샷 명당",
    desc: "오랜 경험과 노하우로 핵심만 콕콕. 한인 가이드만 아는 '인생샷 명당'까지 꼼꼼하게 안내해드려요.",
  },
];

const REASONS = [
  { icon: "🛡️", title: "자체 환불규정 적용", desc: "타 중계 사이트는 출발 30일 전까지만 전액 환불. 카톡 직접 예약은 자체 환불규정이 적용돼요." },
  { icon: "🕐", title: "한국 상담사 24시간 상담", desc: "조이감성투어 한국 예약 상담사와 24시간 편하게 상담하실 수 있습니다." },
  { icon: "💸", title: "투어비 즉시 할인 혜택", desc: "카톡 직접 예약 시 상품별로 1인당 할인 적용 해드려요!" },
];

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const tours = await getTours();
  const reviews = await getRecentReviews(3);
  const bookable = tours.filter((t) => !t.comingSoon && t.kakaoDiscount);

  return (
    <div className="lp">
      {/* ===== Hero ===== */}
      <div className="lp-hero-wrap">
        <div className="lp-hero">
          <video autoPlay muted loop playsInline src={VIDEO_URL} />
          <div className="lp-scrim" />
          <div className="lp-hero-content">
            <div className="lp-nav">
              <Link href="#top" className="lp-logo">
                🏜️ 조이감성<span>투어</span>
              </Link>
              <div className="lp-nav-links">
                {NAV.map((n) => (
                  <a key={n.href} href={n.href}>{n.label}</a>
                ))}
                <a href="#book" className="lp-book">예약·문의</a>
              </div>
              <details className="lp-menu">
                <summary aria-label="메뉴">☰</summary>
                <div className="lp-menu-panel">
                  {NAV.map((n) => (
                    <a key={n.href} href={n.href}>{n.label}</a>
                  ))}
                  <a href="#book">예약·문의</a>
                </div>
              </details>
            </div>

            <div className="lp-spacer" />

            <div className="lp-bottom">
              <p className="lp-headline">
                그랜드캐년의 경이로움을<br />
                <span className="lp-accent">조이감성투어</span>와 함께 만나보세요
              </p>
              <div className="lp-herocard">
                <div className="k-label">💬 카카오톡 문의 / 예약</div>
                <div className="k-brand">조이감성투어</div>
                <div className="k-id">Kakao ID : {KAKAO_ID}</div>
                <div className="k-note">
                  카카오톡에서 위 ID로 검색해 문의·예약해주세요.
                  <br />카톡 직접 예약 시 <b>투어비 즉시 할인</b> 혜택!
                </div>
                <a href="#book" className="k-cta">예약·문의 자세히 보기 →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Tours ===== */}
      <section id="tours" className="lp-section">
        <div className="lp-center">
          <div className="lp-eyebrow">JOY GAMSUNG TOUR</div>
          <div className="lp-h2">그랜드캐년 투어 상품</div>
          <p className="section-sub">라스베가스 출발 · 카톡(ID: {KAKAO_ID}) 직접 예약 시 할인</p>
        </div>
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
                    <div className="price-sub">{t.duration} · {t.region}</div>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/tours" className="lp-more">투어 상품 전체 보기 →</Link>
        </div>
      </section>

      {/* ===== Why ===== */}
      <section id="why" className="lp-section tint">
        <div className="lp-inner">
          <div className="lp-center">
            <div className="lp-eyebrow">WHY JOY GAMSUNG</div>
            <div className="lp-h2">왜 조이감성투어인가요?</div>
            <p className="section-sub">편안함, 감동, 그리고 인생샷까지 — 다녀온 분들이 추천하는 이유</p>
          </div>
          <div className="contact-grid">
            {WHY.map((w) => (
              <div key={w.title} className="contact-card">
                <div className="ico">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Reviews preview ===== */}
      <section id="reviews" className="lp-section">
        <div className="lp-center">
          <div className="lp-eyebrow">REVIEWS</div>
          <div className="lp-h2">고객 후기</div>
          <p className="section-sub">조이감성투어와 함께한 여행자들의 생생한 후기</p>
        </div>
        {reviews.length === 0 ? (
          <p className="empty">아직 후기가 없어요. 첫 번째 후기를 남겨주세요! ✍️</p>
        ) : (
          <div className="review-list" style={{ maxWidth: 760, margin: "0 auto" }}>
            {reviews.map((r) => (
              <div key={r.id} className="review-item">
                <div className="top">
                  <span className="who">{r.name}</span>
                </div>
                <p className="content">{r.content}</p>
                {Array.isArray(r.image_urls) && r.image_urls[0] && (
                  <img className="photo" src={r.image_urls[0]} alt="후기 사진" loading="lazy" />
                )}
                {r.admin_reply && (
                  <div className="admin-reply">
                    <div className="ar-head">🧑‍💼 사장님 답글</div>
                    <p className="ar-body">{r.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <Link href="/reviews" className="lp-more">고객 후기 전체 보기 →</Link>{" "}
          <Link href="/reviews/new" className="lp-more ghost">✍️ 리뷰 쓰기</Link>
        </div>
      </section>

      {/* ===== Booking ===== */}
      <section id="book" className="lp-section tint">
        <div className="lp-inner">
          <div className="lp-center">
            <div className="lp-eyebrow">BOOKING</div>
            <div className="lp-h2">예약 · 문의</div>
            <p className="section-sub">예약과 할인 문의는 카카오톡으로 편하게 연락주세요.</p>
          </div>

          <div className="contact-card" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <div className="ico">💬</div>
            <h3 style={{ marginTop: 10 }}>카카오톡 문의 / 예약</h3>
            <p className="section-sub" style={{ fontSize: 14, marginTop: 6 }}>조이감성투어 카카오톡 ID</p>
            <p className="kakao-id-big">{KAKAO_ID}</p>
            <p className="section-sub" style={{ fontSize: 14, marginTop: 8, marginBottom: 0 }}>
              카카오톡에서 위 ID로 검색해 문의·예약해주세요. 단독투어도 가능합니다.
            </p>
          </div>

          <h3 className="lp-h2" style={{ textAlign: "center", fontSize: 22, marginTop: 44 }}>
            카카오톡으로 직접 예약해야 하는 이유 📢
          </h3>
          <div className="reason-grid">
            {REASONS.map((r) => (
              <div key={r.title} className="reason-card">
                <div className="reason-ico">{r.icon}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>

          {bookable.length > 0 && (
            <>
              <h3 className="lp-h2" style={{ textAlign: "center", fontSize: 22, marginTop: 44 }}>
                카톡 예약 시 할인가 💚
              </h3>
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
            </>
          )}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <div className="brand">🏜️ 조이감성투어</div>
            <p>라스베가스 출발 그랜드캐년 여행 전문</p>
          </div>
          <div style={{ textAlign: "left" }}>
            <p>💬 카카오톡 ID: <span style={{ color: "#fff", fontWeight: 700 }}>{KAKAO_ID}</span> (할인·예약 문의)</p>
            <p>라스베가스 스트립 내 호텔 픽업</p>
            <div className="fnav">
              <a href="#tours">투어 상품</a>
              <a href="#why">왜 조이감성투어인가요?</a>
              <a href="#reviews">고객 후기</a>
              <a href="#book">예약·문의</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
