"use client";

import { useEffect, useRef, useState } from "react";

function Stars({ n }) {
  return <div className="stars">{"★".repeat(n)}{"☆".repeat(5 - n)}</div>;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null); // { type, text }
  const formRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews(data.reviews);
    } catch (err) {
      setMsg({ type: "error", text: "후기를 불러오지 못했습니다: " + err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/reviews", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: "소중한 후기 감사합니다! 🎉" });
      formRef.current?.reset();
      setReviews((prev) => [data.review, ...prev]);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "후기 등록에 실패했습니다." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form ref={formRef} className="review-form" onSubmit={handleSubmit}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>후기 작성하기</h2>
        {msg && <p className={`form-msg ${msg.type}`}>{msg.text}</p>}

        <div className="field-row">
          <div className="field">
            <label htmlFor="name">이름 / 닉네임</label>
            <input id="name" name="name" maxLength={30} required placeholder="홍길동" />
          </div>
          <div className="field">
            <label htmlFor="rating">평점</label>
            <select id="rating" name="rating" defaultValue="5">
              <option value="5">★★★★★ 매우 만족</option>
              <option value="4">★★★★☆ 만족</option>
              <option value="3">★★★☆☆ 보통</option>
              <option value="2">★★☆☆☆ 아쉬움</option>
              <option value="1">★☆☆☆☆ 불만족</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="content">후기 내용</label>
          <textarea
            id="content"
            name="content"
            maxLength={2000}
            required
            placeholder="여행은 어떠셨나요? 솔직한 후기를 남겨주세요."
          />
        </div>

        <div className="field">
          <label htmlFor="image">사진 첨부 (선택 · 5MB 이하)</label>
          <input id="image" name="image" type="file" accept="image/*" />
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "등록 중..." : "후기 등록"}
        </button>
      </form>

      {loading ? (
        <p className="empty">후기를 불러오는 중...</p>
      ) : reviews.length === 0 ? (
        <p className="empty">아직 후기가 없어요. 첫 번째 후기를 남겨주세요! ✍️</p>
      ) : (
        <div className="review-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-item">
              <div className="top">
                <span className="who">{r.name}</span>
                <span className="when">{formatDate(r.created_at)}</span>
              </div>
              <Stars n={r.rating} />
              <p className="content">{r.content}</p>
              {r.image_url && (
                <img className="photo" src={r.image_url} alt="후기 사진" loading="lazy" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
