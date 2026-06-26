"use client";

import { useEffect, useRef, useState } from "react";
import { compressImage } from "../../lib/compressImage";

const RATING_OPTIONS = [
  { v: "5", label: "★★★★★ 매우 만족" },
  { v: "4", label: "★★★★☆ 만족" },
  { v: "3", label: "★★★☆☆ 보통" },
  { v: "2", label: "★★☆☆☆ 아쉬움" },
  { v: "1", label: "★☆☆☆☆ 불만족" },
];

function Stars({ n }) {
  return <div className="stars">{"★".repeat(n) + "☆".repeat(5 - n)}</div>;
}

function formatDate(iso) {
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

// 폼의 image 필드를 압축본으로 교체하고, 비어있으면 제거합니다.
async function withCompressedImage(formData) {
  const file = formData.get("image");
  if (file && typeof file.size === "number" && file.size > 0) {
    formData.set("image", await compressImage(file));
  } else {
    formData.delete("image");
  }
  return formData;
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
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

  async function handleCreate(e) {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const fd = await withCompressedImage(new FormData(e.currentTarget));
      const res = await fetch("/api/reviews", { method: "POST", body: fd });
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

  function handleUpdated(updated) {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }
  function handleDeleted(id) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <form ref={formRef} className="review-form" onSubmit={handleCreate}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>후기 작성하기</h2>
        {msg && <p className={`form-msg ${msg.type}`}>{msg.text}</p>}

        <div className="field-row">
          <div className="field">
            <label htmlFor="name">이름 / 닉네임</label>
            <input id="name" name="name" maxLength={30} required placeholder="홍길동" />
          </div>
          <div className="field">
            <label htmlFor="password">비밀번호 (숫자 4자리)</label>
            <input
              id="password"
              name="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              required
              placeholder="수정·삭제 시 필요"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="rating">평점</label>
          <select id="rating" name="rating" defaultValue="5">
            {RATING_OPTIONS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
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
          <label htmlFor="image">사진 첨부 (선택 · 업로드 시 자동 압축)</label>
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
            <ReviewItem
              key={r.id}
              review={r}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewItem({ review, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function handleEdit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const fd = await withCompressedImage(new FormData(e.currentTarget));
      const res = await fetch(`/api/reviews/${review.id}`, { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdated(data.review);
      setEditing(false);
    } catch (e2) {
      setErr(e2.message || "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const pw = window.prompt("삭제하려면 비밀번호(4자리)를 입력하세요.");
    if (pw == null) return;
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/reviews/${review.id}?password=${encodeURIComponent(pw)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDeleted(review.id);
    } catch (e2) {
      setErr(e2.message || "삭제에 실패했습니다.");
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form className="review-item" onSubmit={handleEdit}>
        {err && <p className="form-msg error">{err}</p>}
        <div className="field">
          <label>비밀번호 (작성 시 입력한 4자리)</label>
          <input
            name="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            required
            placeholder="****"
          />
        </div>
        <div className="field">
          <label>평점</label>
          <select name="rating" defaultValue={String(review.rating)}>
            {RATING_OPTIONS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>후기 내용</label>
          <textarea name="content" maxLength={2000} required defaultValue={review.content} />
        </div>
        {review.image_url && (
          <div className="field">
            <img className="photo" src={review.image_url} alt="현재 사진" />
            <label style={{ fontWeight: 400, marginTop: 6 }}>
              <input type="checkbox" name="removeImage" value="true" /> 기존 사진 삭제
            </label>
          </div>
        )}
        <div className="field">
          <label>사진 교체 (선택)</label>
          <input name="image" type="file" accept="image/*" />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setEditing(false)}
            disabled={busy}
          >
            취소
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="review-item">
      <div className="top">
        <span className="who">{review.name}</span>
        <span className="when">
          {formatDate(review.created_at)}
          {review.updated_at && review.updated_at !== review.created_at ? " (수정됨)" : ""}
        </span>
      </div>
      <Stars n={review.rating} />
      <p className="content">{review.content}</p>
      {review.image_url && (
        <img className="photo" src={review.image_url} alt="후기 사진" loading="lazy" />
      )}
      {err && <p className="form-msg error" style={{ marginTop: 10 }}>{err}</p>}
      <div className="review-actions">
        <button type="button" className="link-btn" onClick={() => setEditing(true)}>
          수정
        </button>
        <button type="button" className="link-btn danger" onClick={handleDelete} disabled={busy}>
          삭제
        </button>
      </div>
    </div>
  );
}
