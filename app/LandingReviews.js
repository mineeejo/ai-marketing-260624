"use client";

import { useState } from "react";
import Link from "next/link";
import { Gallery } from "./(site)/reviews/shared";

function fmt(iso) {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// 메인 후기 미리보기: 카드 클릭 시 팝업으로 후기 전체 + 사진 여러 장(크게 보기).
export default function LandingReviews({ reviews }) {
  const [active, setActive] = useState(null);

  if (!reviews || reviews.length === 0) {
    return <p className="empty">아직 후기가 없어요. 첫 번째 후기를 남겨주세요! ✍️</p>;
  }

  return (
    <>
      <div className="review-list" style={{ maxWidth: 760, margin: "0 auto" }}>
        {reviews.map((r) => {
          const photos = Array.isArray(r.image_urls) ? r.image_urls : [];
          return (
            <button
              key={r.id}
              type="button"
              className="review-item lp-rv-card"
              onClick={() => setActive(r)}
            >
              <p className="content lp-rv-clamp">{r.content}</p>
              {photos.length > 0 && (
                <div className="lp-rv-photos">
                  {photos.slice(0, 4).map((u, i) => (
                    <span
                      key={i}
                      className="lp-rv-thumb"
                      style={{ backgroundImage: `url(${u})` }}
                    >
                      {i === 3 && photos.length > 4 && (
                        <span className="lp-rv-more">+{photos.length - 4}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
              {r.admin_reply && (
                <div className="admin-reply">
                  <div className="ar-head">🧑‍💼 사장님 답글</div>
                  <p className="ar-body lp-rv-clamp-sm">{r.admin_reply}</p>
                </div>
              )}
              <span className="lp-rv-detail">더보기 →</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="lp-rv-modal"
          onClick={(e) => e.target === e.currentTarget && setActive(null)}
        >
          <div className="lp-rv-modal-panel">
            <button
              className="lp-rv-close"
              onClick={() => setActive(null)}
              aria-label="닫기"
            >
              ✕
            </button>
            <div className="rv-head" style={{ marginTop: 8 }}>
              <div className="rv-row">
                <span className="rv-label">작성자</span>
                <span className="who">{active.name}</span>
              </div>
              <div className="rv-row">
                <span className="rv-label">작성일</span>
                <span className="when">{fmt(active.created_at)}</span>
              </div>
            </div>
            <p className="content" style={{ whiteSpace: "pre-wrap" }}>
              {active.content}
            </p>
            <Gallery urls={active.image_urls} />
            {active.admin_reply && (
              <div className="admin-reply">
                <div className="ar-head">🧑‍💼 사장님 답글</div>
                <p className="ar-body">{active.admin_reply}</p>
              </div>
            )}
            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
              <Link href="/reviews" className="lp-more">고객 후기 전체 보기 →</Link>
              <button className="lp-more ghost" onClick={() => setActive(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
